import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Input, Space } from "antd";
import dompurifyFactory from "dompurify";
import { marked } from "marked";
import { useMemo, useState } from "react";
import "./MarkdownEditor.scss";

export interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function getLineBounds(text: string, position: number) {
  const start = text.lastIndexOf("\n", Math.max(0, position - 1)) + 1;
  const nextNewline = text.indexOf("\n", position);
  return {
    start,
    end: nextNewline === -1 ? text.length : nextNewline,
  };
}

export function MarkdownEditor(props: MarkdownEditorProps) {
  const [value, setValue] = useState(props.value || "");
  const [previewing, setPreviewing] = useState(false);
  const preview = useMemo(() => {
    if (!previewing || typeof window === "undefined") {
      return "";
    }
    return dompurifyFactory(window).sanitize(marked.parse(value) as string);
  }, [previewing, value]);

  const handleChange = (nextValue: string) => {
    setValue(nextValue);
    props.onChange?.(nextValue);
  };

  return (
    <div className="markdownEditor">
      <Space className="markdownEditorToolbar">
        <Button
          type={!previewing ? "primary" : "default"}
          icon={<EditOutlined />}
          onClick={() => setPreviewing(false)}
        >
          Write
        </Button>
        <Button
          type={previewing ? "primary" : "default"}
          icon={<EyeOutlined />}
          onClick={() => setPreviewing(true)}
        >
          Preview
        </Button>
      </Space>
      {previewing ? (
        <div
          className="markdown markdownPreview"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      ) : (
        <Input.TextArea
          className="mde-text"
          value={value}
          autoSize={{ minRows: 12 }}
          onChange={(event) => handleChange(event.target.value)}
        />
      )}
    </div>
  );
}
