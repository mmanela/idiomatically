import type JSONEditor from "jsoneditor";
import type { JSONEditorOptions } from "jsoneditor";
import { Component, createRef, type RefObject } from "react";
import "jsoneditor/dist/jsoneditor.css";

export type JsonEditorProps = {
  json: string;
} & JSONEditorOptions;

export class JsonEditor extends Component<JsonEditorProps> {
  private jsoneditor?: JSONEditor;
  private containerRef: RefObject<HTMLDivElement | null> = createRef();
  private mounted = false;

  async componentDidMount() {
    this.mounted = true;
    const { default: Editor } = await import("jsoneditor");
    if (!this.mounted || !this.containerRef.current) {
      return;
    }

    const defaults: JSONEditorOptions = {
      mainMenuBar: false,
      mode: "form",
      navigationBar: false,
    };
    this.jsoneditor = new Editor(this.containerRef.current, {
      ...defaults,
      ...this.props,
    });
    this.jsoneditor.set(this.props.json);
    this.jsoneditor.expandAll();
  }

  componentWillUnmount() {
    this.mounted = false;
    this.jsoneditor?.destroy();
  }

  componentDidUpdate() {
    this.jsoneditor?.update(this.props.json);
  }

  render() {
    return (
      <div
        className="jsoneditor-react-container"
        ref={this.containerRef}
      />
    );
  }
}
