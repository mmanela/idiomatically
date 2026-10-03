import dompurifyFactory from "dompurify";
import { marked } from "marked";
import { useEffect, useState } from "react";

export interface MarkdownContentProps {
  source: string;
  className?: string;
}

export function MarkdownContent({
  source,
  className,
}: MarkdownContentProps) {
  const [rendered, setRendered] = useState<string | null>(null);

  useEffect(() => {
    const dompurify = dompurifyFactory(window);
    setRendered(
      dompurify.sanitize(marked.parse(source, { async: false }) as string),
    );
  }, [source]);

  if (rendered) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    );
  }

  return <div className={className}>{markdownToPlainText(source)}</div>;
}

export function markdownToPlainText(source: string) {
  return source
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-+*]\s+/gm, "")
    .replace(/(\*\*|__|~~|`)(.*?)\1/g, "$2")
    .replace(/[*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
