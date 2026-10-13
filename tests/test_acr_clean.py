import json
import os
from pathlib import Path
import shlex
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "acr_clean.sh"


def digest(letter):
    return "sha256:" + letter * 64


def metadata(letter, tags=None):
    image = {"digest": digest(letter)}
    if tags is not None:
        image["tags"] = tags
    return image


def mock_az():
    scenario = json.loads(os.environ["ACR_TEST_SCENARIO"])
    log = Path(os.environ["ACR_TEST_LOG"])
    calls = [json.loads(line) for line in log.read_text().splitlines()]
    args = sys.argv[1:]
    with log.open("a") as output:
        output.write(json.dumps(args) + "\n")

    if args[:3] == ["acr", "manifest", "list-metadata"]:
        command = "list-metadata"
        prior_lists = sum(call[:3] == args[:3] for call in calls)
        result = scenario["metadata"]
        if prior_lists >= scenario.get("change_after", 1):
            result = scenario.get("changed_metadata", result)
    elif args[:3] == ["acr", "manifest", "show"]:
        command = "show"
        image_digest = args[args.index("--name") + 1].split("@")[1]
        result = scenario.get("manifests", {}).get(image_digest, {"schemaVersion": 2})
    elif args[:3] == ["acr", "repository", "delete"]:
        command = "delete"
        assert "--yes" in args
        result = {}
    else:
        raise AssertionError(f"Unexpected Azure command: {args}")

    if scenario.get("fail") == command:
        print(f"Mock {command} failed", file=sys.stderr)
        sys.exit(1)
    print(json.dumps(result))


class AcrCleanTests(unittest.TestCase):
    def run_cleanup(self, images, *args, env=None, **scenario):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            az = directory / "az"
            az.write_text(
                "#!/bin/bash\nexec "
                + shlex.quote(sys.executable)
                + " "
                + shlex.quote(str(Path(__file__).resolve()))
                + ' "$@"\n'
            )
            az.chmod(0o755)
            log = directory / "calls.jsonl"
            log.write_text("")
            environment = {
                **os.environ,
                "REGISTRY": "testregistry",
                "REPOSITORY": "testrepo",
                **(env or {}),
                "PATH": str(directory) + os.pathsep + os.environ["PATH"],
                "ACR_TEST_LOG": str(log),
                "ACR_TEST_SCENARIO": json.dumps({"metadata": images, **scenario}),
            }
            result = subprocess.run(
                ["bash", str(SCRIPT), *args],
                env=environment,
                capture_output=True,
                text=True,
                timeout=30,
            )
            calls = [json.loads(line) for line in log.read_text().splitlines()]
        deletions = [
            call[call.index("--image") + 1]
            for call in calls
            if call[:3] == ["acr", "repository", "delete"]
        ]
        return result, calls, deletions

    def test_default_and_explicit_dry_run_never_delete(self):
        for args in [(), ("--dry-run",)]:
            with self.subTest(args=args):
                result, _, deletions = self.run_cleanup(
                    [metadata("a", ["production"]), metadata("d", ["old"]), metadata("e")],
                    *args,
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertIn("2 manifest(s) selected", result.stdout)
                self.assertEqual(deletions, [])

    def test_delete_keeps_both_aliases_and_all_tags_on_their_digest(self):
        result, _, deletions = self.run_cleanup(
            [
                metadata("a", ["production", "commit-a"]),
                metadata("b", ["latest", "commit-b"]),
                metadata("d", ["newest-commit"]),
                metadata("e"),
            ],
            "--delete",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(deletions, ["testrepo@" + digest("d"), "testrepo@" + digest("e")])

    def test_either_alias_alone_is_enough(self):
        for tag in ["production", "latest"]:
            with self.subTest(tag=tag):
                result, _, deletions = self.run_cleanup(
                    [metadata("a", [tag]), metadata("d", ["production-old"])], "--delete"
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(deletions, ["testrepo@" + digest("d")])

    def test_protects_nested_and_shared_multi_platform_children(self):
        manifests = {
            digest("a"): {"schemaVersion": 2, "manifests": [{"digest": digest("b")}]},
            digest("b"): {"schemaVersion": 2, "manifests": [{"digest": digest("c")}]},
        }
        result, _, deletions = self.run_cleanup(
            [metadata("a", ["production"]), metadata("b"), metadata("c"), metadata("d")],
            "--delete",
            manifests=manifests,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(deletions, ["testrepo@" + digest("d")])

    def test_no_alias_refuses_deletion(self):
        result, _, deletions = self.run_cleanup([metadata("d", ["old"])], "--delete")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("refusing to delete", result.stderr)
        self.assertEqual(deletions, [])

    def test_empty_and_protected_only_repositories(self):
        for images in [[], [metadata("a", ["production", "latest"])]]:
            with self.subTest(images=images):
                result, _, deletions = self.run_cleanup(images, "--delete")
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(deletions, [])
                self.assertIn("nothing to delete", result.stdout)

    def test_metadata_and_protected_manifest_failures_stop_before_delete(self):
        for scenario in [
            {"fail": "list-metadata"},
            {"fail": "show"},
            {"manifests": {digest("a"): {"schemaVersion": 2, "manifests": [{"digest": "bad"}]}}},
            {"manifests": {digest("a"): {"unexpected": "response"}}},
        ]:
            with self.subTest(scenario=scenario):
                result, _, deletions = self.run_cleanup(
                    [metadata("a", ["production"]), metadata("d")], "--delete", **scenario
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(deletions, [])

    def test_malformed_metadata_is_rejected(self):
        for images in [
            {"error": "not a list"},
            [{"digest": "bad", "tags": ["production"]}],
            [metadata("a", "production")],
        ]:
            with self.subTest(images=images):
                result, _, deletions = self.run_cleanup(images, "--delete")
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(deletions, [])

    def test_alias_changes_stop_before_next_delete(self):
        for change_after, expected in [(1, []), (2, ["testrepo@" + digest("d")])]:
            with self.subTest(change_after=change_after):
                result, _, deletions = self.run_cleanup(
                    [metadata("a", ["production"]), metadata("d"), metadata("e")],
                    "--delete",
                    changed_metadata=[metadata("a"), metadata("e", ["production"])],
                    change_after=change_after,
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("changed during cleanup", result.stderr)
                self.assertEqual(deletions, expected)

    def test_failed_delete_stops_remaining_deletes(self):
        result, _, deletions = self.run_cleanup(
            [metadata("a", ["production"]), metadata("d"), metadata("e")],
            "--delete",
            fail="delete",
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(deletions, ["testrepo@" + digest("d")])
        self.assertNotIn("Deleted 2", result.stdout)

    def test_target_overrides_are_used_for_reads_and_deletes(self):
        result, calls, deletions = self.run_cleanup(
            [metadata("a", ["latest"]), metadata("d")],
            "--delete",
            env={"REGISTRY": "otherregistry", "REPOSITORY": "nested/repo"},
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        for call in calls:
            registry_flag = "--name" if call[1] == "repository" else "--registry"
            self.assertEqual(call[call.index(registry_flag) + 1], "otherregistry")
        self.assertEqual(deletions, ["nested/repo@" + digest("d")])

    def test_help_and_unknown_arguments_do_not_call_azure(self):
        for args, code in [(("--help",), 0), (("--unknown",), 2)]:
            with self.subTest(args=args):
                result, calls, _ = self.run_cleanup([], *args)
                self.assertEqual(result.returncode, code)
                self.assertEqual(calls, [])


if __name__ == "__main__":
    if "ACR_TEST_SCENARIO" in os.environ:
        mock_az()
    else:
        unittest.main()
