"use client";

type MessageBlock =
  | { text: string; type: "heading" | "paragraph" }
  | { items: string[]; ordered: boolean; type: "list" };

type FormattedAssistantMessageProps = {
  content: string;
};

export function FormattedAssistantMessage({
  content
}: FormattedAssistantMessageProps) {
  const { blocks, sources } = parseAssistantContent(content);

  return (
    <div className="space-y-3 text-sm leading-6 text-slate-800">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <p
              className="text-xs font-bold uppercase tracking-wide text-costaatt-blue"
              key={`heading-${index}`}
            >
              {renderInlineText(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";

          return (
            <ListTag
              className={`space-y-2 pl-5 ${
                block.ordered ? "list-decimal" : "list-disc"
              }`}
              key={`list-${index}`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>
                  {renderInlineText(item)}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p className="max-w-prose" key={`paragraph-${index}`}>
            {renderInlineText(block.text)}
          </p>
        );
      })}
      {sources.length ? (
        <div className="border-t border-slate-200 pt-3">
          {sources.map((source, index) => (
            <p
              className="text-xs font-semibold text-slate-500"
              key={`${source}-${index}`}
            >
              Source: {stripMarkdown(source.replace(/^source:\s*/i, ""))}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function parseAssistantContent(content: string) {
  const blocks: MessageBlock[] = [];
  const sources: string[] = [];
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\s+(#{2,6}\s+)/g, "\n\n$1")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push({
      text: stripBlockText(paragraph.join(" ")),
      type: "paragraph"
    });
    paragraph = [];
  }

  function flushList() {
    if (!listItems.length) return;
    blocks.push({
      items: listItems.map(stripBlockText),
      ordered: listOrdered,
      type: "list"
    });
    listItems = [];
    listOrdered = false;
  }

  for (const line of lines) {
    if (/^source:\s*/i.test(line)) {
      flushParagraph();
      flushList();
      sources.push(line);
      continue;
    }

    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        text: stripBlockText(headingMatch[1]),
        type: "heading"
      });
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      if (listItems.length && listOrdered) flushList();
      listOrdered = false;
      listItems.push(bulletMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listItems.length && !listOrdered) flushList();
      listOrdered = true;
      listItems.push(orderedMatch[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return { blocks, sources };
}

function renderInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong className="font-bold text-costaatt-navy" key={`${part}-${index}`}>
          {stripMarkdown(part.slice(2, -2))}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{stripMarkdown(part)}</span>;
  });
}

function stripMarkdown(value: string) {
  return value
    .replace(/^#{1,6}\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

function stripBlockText(value: string) {
  return value.replace(/^#{1,6}\s+/, "").replace(/`/g, "").trim();
}
