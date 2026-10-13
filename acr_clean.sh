#!/bin/bash

set -Eeuo pipefail
trap 'echo "ACR cleanup failed at line $LINENO; cleanup stopped." >&2' ERR

REGISTRY="${REGISTRY:-idiomatically893a}"
REPOSITORY="${REPOSITORY:-idiomatically}"
delete=false

usage() {
    cat <<'EOF'
Usage: bash acr_clean.sh [--dry-run | --delete]

Keep images tagged production or latest and their child manifests.
Remove every other manifest, including untagged images and old commit-SHA tags.
The default is a dry run. Use --delete to actually delete the listed images.

Override the target with REGISTRY and REPOSITORY environment variables.
Requires Azure CLI (az login) and jq.

WARNING: This removes rollback images. Verify the running image is tagged
production or latest, including after a rollback. Do not run during a build,
deployment, or tag update; tag checks and deletes are not atomic.
EOF
}

for arg in "$@"; do
    case "$arg" in
        --delete) delete=true ;;
        --dry-run) delete=false ;;
        --help|-h) usage; exit 0 ;;
        *) echo "Unknown argument: $arg" >&2; usage >&2; exit 2 ;;
    esac
done

for tool in az jq; do
    if ! command -v "$tool" >/dev/null 2>&1; then
        echo "Required command not found: $tool" >&2
        exit 1
    fi
done

list_manifests() {
    az acr manifest list-metadata --registry "$REGISTRY" --name "$REPOSITORY" \
        --orderby time_asc --output json |
        jq -ce '
            if type == "array" and all(.[];
                (.digest | type == "string" and test("^sha256:[0-9a-f]{64}$"))
                and ((.tags // []) | type == "array" and all(.[]; type == "string"))
            ) then . else error("Invalid manifest metadata") end
        '
}

protected_roots() {
    jq -c '[.[] | select(any((.tags // [])[];
        . == "production" or . == "latest")) | .digest] | unique'
}

manifests=$(list_manifests)
if [[ "$manifests" == "[]" ]]; then
    echo "No images in $REGISTRY/$REPOSITORY; nothing to delete."
    exit 0
fi

roots=$(protected_roots <<< "$manifests")
if [[ "$roots" == "[]" ]]; then
    echo "No production or latest tag in $REGISTRY/$REPOSITORY; refusing to delete anything." >&2
    exit 1
fi

protected='[]'
protect_manifest() {
    local digest="$1"
    local manifest children child
    if jq -e --arg digest "$digest" 'index($digest) != null' <<< "$protected" >/dev/null; then
        return
    fi
    protected=$(jq -c --arg digest "$digest" '. + [$digest]' <<< "$protected")

    # Multi-platform images reference untagged manifests that must also survive.
    manifest=$(az acr manifest show --registry "$REGISTRY" \
        --name "$REPOSITORY@$digest" --output json)
    children=$(jq -er '
        if .schemaVersion == 2 and ((.manifests // []) | type == "array"
            and all(.[]; .digest | type == "string" and test("^sha256:[0-9a-f]{64}$")))
        then [.manifests[]?.digest] | join("\n")
        else error("Invalid protected image manifest") end
    ' <<< "$manifest")
    while IFS= read -r child; do
        [[ -n "$child" ]] || continue
        protect_manifest "$child"
    done <<< "$children"
}

root_digests=$(jq -r '.[]' <<< "$roots")
while IFS= read -r digest; do
    protect_manifest "$digest"
done <<< "$root_digests"

candidates=$(jq -c --argjson protected "$protected" '
    [.[] | select(.digest as $digest | $protected | index($digest) == null)]
' <<< "$manifests")
count=$(jq 'length' <<< "$candidates")
if [[ "$count" == 0 ]]; then
    echo "Only protected images remain in $REGISTRY/$REPOSITORY; nothing to delete."
    exit 0
fi

echo "Cleanup target: $REGISTRY/$REPOSITORY"
echo "Keeping production/latest images and their child manifests."
echo "$count manifest(s) selected for deletion (digest, tags):"
jq -r '.[] | [.digest, ((.tags // []) | join(","))] | @tsv' <<< "$candidates"

if [[ "$delete" != true ]]; then
    echo "Dry run: no images deleted. Run with --delete to apply this cleanup."
    exit 0
fi

digests=$(jq -r '.[].digest' <<< "$candidates")
while IFS= read -r digest; do
    # Stop if a deployment has moved an alias since the plan was built.
    current_roots=$(list_manifests | protected_roots)
    if [[ "$current_roots" != "$roots" ]]; then
        echo "Production/latest images changed during cleanup; stopping. Rerun to build a new plan." >&2
        exit 1
    fi
    echo "Deleting $REPOSITORY@$digest"
    az acr repository delete --name "$REGISTRY" --image "$REPOSITORY@$digest" --yes
done <<< "$digests"

echo "Deleted $count manifest(s)."
