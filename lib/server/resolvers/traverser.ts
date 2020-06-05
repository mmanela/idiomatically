import { GraphQLResolveInfo, FieldNode, SelectionSetNode, InlineFragmentNode } from 'graphql';

export type FieldNodeVisitor = (fieldNode: FieldNode) => void;
export function traverse(info: GraphQLResolveInfo, fieldNodeVisitor: FieldNodeVisitor) {
    for (const fieldNode of info.fieldNodes) {
        traverseFieldNode(fieldNode, fieldNodeVisitor);
    }

    // Ideally, should filter this to just the fragments we found used above.
    // But for now lets just assume you won't send fragments if you arent using them
    for (const key of Object.keys(info.fragments)) {
        const fragment = info.fragments[key];
        traverseSelectionSetNode(fragment.selectionSet, fieldNodeVisitor);
    }
}

function traverseFieldNode(fieldNode: FieldNode, fieldNodeVisitor: FieldNodeVisitor) {
    fieldNodeVisitor(fieldNode);
    traverseSelectionSetNode(fieldNode.selectionSet, fieldNodeVisitor);
}

function traverseInlineFragment(inlineFragmentNode: InlineFragmentNode, fieldNodeVisitor: FieldNodeVisitor) {
    traverseSelectionSetNode(inlineFragmentNode.selectionSet, fieldNodeVisitor);
}

function traverseSelectionSetNode(selectionSet: SelectionSetNode | undefined, fieldNodeVisitor: FieldNodeVisitor) {
    if (!selectionSet) {
        return;
    }

    for (const selection of selectionSet.selections) {
        switch (selection.kind) {
            case "Field":
                traverseFieldNode(selection, fieldNodeVisitor);
                break;
            case "FragmentSpread":
                // Not supported yet
                break;
            case "InlineFragment":
                traverseInlineFragment(selection, fieldNodeVisitor);
                break;
            default:
                break;
        }
    }
}