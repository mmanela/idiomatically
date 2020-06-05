import React, { Component } from "react";
import "jsoneditor/dist/jsoneditor.css";
type JSONEditor = import("jsoneditor").default;
type JSONEditorOptions = import("jsoneditor").JSONEditorOptions;

export type JsonEditorProps = {
  json: string;
} & JSONEditorOptions;

export class JsonEditor extends Component<JsonEditorProps> {
  private jsoneditor?: JSONEditor;
  private containerRef: React.RefObject<HTMLDivElement>;

  constructor(props: JsonEditorProps) {
    super(props);
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const Editor = require("jsoneditor");
    const defaults: JSONEditorOptions = {
      mainMenuBar: false,
      mode: "form",
      navigationBar: false
    };
    const options = { ...defaults, ...this.props };
    this.jsoneditor = new Editor(this.containerRef.current!, options);
    if (this.jsoneditor) {
      this.jsoneditor.set(this.props.json);
      this.jsoneditor.expandAll();
    }
  }

  componentWillUnmount() {
    if (this.jsoneditor) {
      this.jsoneditor.destroy();
    }
  }

  componentDidUpdate() {
    if (this.jsoneditor) {
      this.jsoneditor.update(this.props.json);
    }
  }

  render() {
    return <div className="jsoneditor-react-container" ref={this.containerRef} />;
  }
}
