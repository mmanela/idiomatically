import * as React from "react";
import ReactMde, { SvgIcon } from "react-mde";
import marked from "marked";
import dompurifyFactory from "dompurify";
import "react-mde/lib/styles/scss/react-mde-all.scss";
import { ToolbarCommands, Command, Selection } from "react-mde/lib/definitions/types";
import "./MarkdownEditor.scss";

export interface MarkdownEditorProps {
    value?: string;
    onChange?: (value: string) => void;
}

export function getToolbarCommands(): ToolbarCommands {
    return [
        ["h1", "bold", "italic"],
        ["link", "quote"],
        ["unordered-list", "ordered-list"]
    ];
}

export function getLineBounds(text: string, position: number): Selection {
    if (!text) {
        return { start: 0, end: 0 };
    }

    const isNewLine = (c: string) => c.charCodeAt(0) === 10;

    let start = 0, end = 0;
    for (let i = position; i - 1 > -1; i--) {
        if (isNewLine(text[i - 1]) || i === 0) {
            start = i;
            break;
        }
    }

    for (let i = position; i <= text.length; i++) {
        if (i >= text.length || isNewLine(text[i]) ) {
            end = i;
            break;
        }
    }

    return { start, end };
}

export const h1Command: Command = {
    buttonProps: { "aria-label": "Add header" }, icon: () => (
        <SvgIcon icon="header" />
    ),
    execute: ({ initialState, textApi }) => {
        textApi.setSelectionRange(getLineBounds(initialState.text, initialState.selection.start));
        textApi.replaceSelection("# " + textApi.getState().selectedText);
    }
}

export const MarkdownEditor: React.FunctionComponent<MarkdownEditorProps> = props => {
    const [value, setValue] = React.useState(props.value || "");
    const [selectedTab, setSelectedTab] = React.useState<"write" | "preview">(
        "write"
    );
    const dompurify = dompurifyFactory(window);

    const handleChange = (value: string) => {
        setValue(value);
        if (props.onChange) {
            props.onChange(value);
        }
    }

    return (
        <div className="markdownEditor">
            <ReactMde
                value={value}
                commands={{
                    "h1": h1Command
                }}
                toolbarCommands={getToolbarCommands()}
                onChange={handleChange}
                minEditorHeight={300}
                minPreviewHeight={300}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={markdown => {
                    if (!markdown) {
                        return Promise.resolve("");
                    }
                    return Promise.resolve(dompurify.sanitize(marked(markdown)));

                }
                }
                childProps={{
                    writeButton: {
                        tabIndex: -1
                    }
                }}
            />
        </div>
    );
}
