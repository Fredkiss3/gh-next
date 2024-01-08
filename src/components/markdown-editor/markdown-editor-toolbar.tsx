import * as React from "react";
// components
import {
  HeadingIcon,
  BoldIcon,
  ItalicIcon,
  QuoteIcon,
  CodeIcon,
  LinkIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  TasklistIcon,
  MentionIcon,
  CrossReferenceIcon,
  DiffIgnoredIcon,
  StrikethroughIcon,
} from "@primer/octicons-react";
import { ActionToolbar } from "~/components/action-toolbar";

// utils
import { isValidURL } from "~/lib/shared/utils.shared";

// types
import type { ActionToolbarItemGroups } from "~/components/action-toolbar";

type MarkdownEditorToolbarProps = {
  textAreaRef: React.RefObject<React.ElementRef<"textarea">>;
  onTextContentChange: (newText: string) => void;
  showItems?: boolean;
};

export const MarkdownEditorToolbar = React.forwardRef<
  React.ElementRef<typeof ActionToolbar>,
  MarkdownEditorToolbarProps
>(function MarkdownTextAreaToolbar(
  { textAreaRef, onTextContentChange, showItems = true },
  ref,
) {
  function addOrRemoveHeading() {
    const textArea = textAreaRef.current;
    if (textArea) {
      const textContent = textArea.value;
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;

      const untilSelectionStart = textContent.slice(0, selectionStart);
      const fromSelectionStart = textContent.slice(selectionStart);

      const allPreviousLines = untilSelectionStart.split("\n");
      const currentLine = allPreviousLines.pop();

      const headingRegex = /^(#+ ?)/;
      const match = (currentLine ?? "").match(headingRegex);
      const currentLineIsHeading = !!match;

      if (currentLineIsHeading) {
        const totalMatchedChars = match[0].length;
        const newLineWithoutHeading = (currentLine ?? "").replace(
          headingRegex,
          "",
        );

        const result =
          [...allPreviousLines, newLineWithoutHeading].join("\n") +
          fromSelectionStart;

        onTextContentChange(result);
        textArea.setSelectionRange(
          selectionStart - totalMatchedChars,
          selectionEnd - totalMatchedChars,
        );
      } else {
        const newLineWithHeading = "### " + (currentLine ?? "");

        const result =
          [...allPreviousLines, newLineWithHeading].join("\n") +
          fromSelectionStart;

        onTextContentChange(result);
        textArea.setSelectionRange(selectionStart + 4, selectionEnd + 4);
      }
      textArea.focus();
    }
  }
  function addOrRemoveQuote() {
    const textArea = textAreaRef.current;
    if (textArea) {
      const textContent = textArea.value;
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;

      const untilSelectionStart = textContent.slice(0, selectionStart);
      const fromSelectionStart = textContent.slice(selectionStart);

      const allPreviousLines = untilSelectionStart.split("\n");
      const currentLine = allPreviousLines.pop();

      const quoteRegex = /^(> ?)/;
      const match = (currentLine ?? "").match(quoteRegex);
      const currentLineIsQuote = !!match;

      if (currentLineIsQuote) {
        const totalMatchedChars = match[0].length;
        const newLineWithoutQuote = (currentLine ?? "")
          .replace(quoteRegex, "")
          .trimStart();

        const result =
          [...allPreviousLines, newLineWithoutQuote].join("\n") +
          fromSelectionStart;

        onTextContentChange(result);
        textArea.setSelectionRange(
          selectionStart - totalMatchedChars,
          selectionEnd - totalMatchedChars,
        );
      } else {
        const newLineWithQuote = "> " + (currentLine ?? "");

        const result =
          [...allPreviousLines, newLineWithQuote].join("\n") +
          fromSelectionStart;

        onTextContentChange(result);
        textArea.setSelectionRange(selectionStart + 2, selectionEnd + 2);
      }
      textArea.focus();
    }
  }
  function addOrRemoveSurroundingChars(chars: string) {
    const textArea = textAreaRef.current;
    if (textArea) {
      const textContent = textArea.value;
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;

      const isSelectingMultipleChars = selectionEnd - selectionStart > 0;

      if (isSelectingMultipleChars) {
        const selectedContentBolded = textContent.slice(
          selectionStart - chars.length,
          selectionEnd + chars.length,
        );

        const isTextAlreadyBolded =
          selectedContentBolded.startsWith(chars) &&
          selectedContentBolded.endsWith(chars);

        if (isTextAlreadyBolded) {
          onTextContentChange(
            stripSurroundingText({
              text: textContent,
              startIndex: selectionStart - chars.length,
              endIndex: selectionEnd + chars.length,
              surroundingText: chars,
            }),
          );
          // keep the selection considering the bold stars removed
          textArea.setSelectionRange(
            selectionStart - chars.length,
            selectionEnd - chars.length,
          );
        } else {
          onTextContentChange(
            surroundTextWith({
              text: textContent,
              startIndex: selectionStart,
              endIndex: selectionEnd,
              beforeText: chars,
            }),
          );
          // keep the selection considering the bold stars added
          textArea.setSelectionRange(
            selectionStart + chars.length,
            selectionEnd + chars.length,
          );
        }
      } else {
        const { start, end } = getSelectionStartAndSelectionEnd(
          textContent,
          selectionEnd,
        );

        const selectedContent = textContent.slice(start, end);
        const isTextAlreadyBolded =
          selectedContent.startsWith(chars) && selectedContent.endsWith(chars);

        if (isTextAlreadyBolded) {
          onTextContentChange(
            stripSurroundingText({
              text: textContent,
              startIndex: start,
              endIndex: end,
              surroundingText: chars,
            }),
          );

          // keep the selection considering the bold stars removed
          textArea.setSelectionRange(
            selectionEnd - chars.length,
            selectionEnd - chars.length,
          );
        } else {
          onTextContentChange(
            surroundTextWith({
              text: textContent,
              startIndex: start,
              endIndex: end,
              beforeText: chars,
            }),
          );

          // keep the selection considering the bold stars added
          textArea.setSelectionRange(
            selectionEnd + chars.length,
            selectionEnd + chars.length,
          );
        }
      }
      textArea.focus();
    }
  }

  function addLink() {
    const textArea = textAreaRef.current;
    if (textArea) {
      const textContent = textArea.value;
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;

      const isSelectingMultipleChars = selectionEnd - selectionStart > 0;

      if (isSelectingMultipleChars) {
        const untilSelectionStart = textContent.slice(0, selectionStart);
        const fromSelectionEnd = textContent.slice(selectionEnd);
        const selectedText = textContent.slice(selectionStart, selectionEnd);

        if (isValidURL(selectedText)) {
          const newTextContent =
            untilSelectionStart + `[](${selectedText})` + fromSelectionEnd;

          onTextContentChange(newTextContent);

          textArea.setSelectionRange(selectionStart + 1, selectionStart + 1);
        } else {
          const newTextContent =
            untilSelectionStart + `[${selectedText}](url)` + fromSelectionEnd;

          const AFTER_URL_START_QUOTE = selectionEnd + 3;
          const BEFORE_URL_END_QUOTE = selectionEnd + 6;
          onTextContentChange(newTextContent);
          textArea.setSelectionRange(
            AFTER_URL_START_QUOTE,
            BEFORE_URL_END_QUOTE,
          );
        }
      } else {
        const untilSelectionEnd = textContent.slice(0, selectionEnd);
        const fromSelectionEnd = textContent.slice(selectionEnd);
        const newTextContent = untilSelectionEnd + "[](url)" + fromSelectionEnd;

        onTextContentChange(newTextContent);
        textArea.setSelectionRange(selectionEnd + 1, selectionEnd + 1);
      }

      textArea.focus();
    }
  }

  const itemGroups = [
    [
      {
        id: "header",
        label: "Header",
        icon: HeadingIcon,
        onClick: addOrRemoveHeading,
      },
      {
        id: "bold",
        label: "Bold",
        onClick: () => addOrRemoveSurroundingChars("**"),
        icon: BoldIcon,
      },
      {
        id: "italic",
        label: "Italic",
        onClick: () => addOrRemoveSurroundingChars("_"),
        icon: ItalicIcon,
      },
      {
        id: "quote",
        label: "Quote",
        onClick: addOrRemoveQuote,
        icon: QuoteIcon,
      },
      {
        id: "code",
        label: "Code",
        onClick: () => addOrRemoveSurroundingChars("`"),
        icon: CodeIcon,
      },
      {
        id: "strike-through",
        label: "Strike through",
        onClick: () => addOrRemoveSurroundingChars("~~"),
        icon: StrikethroughIcon,
      },
      {
        id: "link",
        label: "Link",
        onClick: addLink,
        icon: LinkIcon,
      },
    ],
    [
      {
        id: "ordered-list",
        label: "Numbered list",
        onClick: () => {},
        icon: ListOrderedIcon,
      },
      {
        id: "unordered-list",
        label: "Unordered list",
        onClick: () => {},
        icon: ListUnorderedIcon,
      },
      {
        id: "task-list",
        label: "Task list",
        onClick: () => {},
        icon: TasklistIcon,
      },
    ],
    [
      {
        id: "mentions",
        label: "Mentions",
        onClick: () => {},
        icon: MentionIcon,
      },
      {
        id: "references",
        label: "References",
        onClick: () => {},
        icon: CrossReferenceIcon,
      },
      {
        id: "commands",
        label: "Slash commands",
        onClick: () => {},
        icon: DiffIgnoredIcon,
      },
    ],
  ] satisfies Array<ActionToolbarItemGroups>;

  return (
    <ActionToolbar
      ref={ref}
      title="Formatting options"
      className="border-b border-neutral"
      itemGroups={itemGroups}
      showItems={showItems}
    />
  );
});

function getSelectionStartAndSelectionEnd(
  text: string,
  cursorPosition: number,
) {
  const nextWord = text.slice(cursorPosition).split(/[ \n]/)[0];
  const previousWord = text
    .slice(0, cursorPosition)
    .split(/[ \n]/)
    .reverse()[0];

  const start = cursorPosition - previousWord.length;
  const end = cursorPosition + nextWord.length;

  return { start, end };
}

type SurroundTextWithArgs = {
  text: string;
  startIndex: number;
  endIndex: number;
  beforeText: string;
  afterText?: string;
};

function surroundTextWith({
  text,
  startIndex,
  endIndex,
  beforeText,
  afterText = beforeText,
}: SurroundTextWithArgs) {
  const untilSelectionStart = text.slice(0, startIndex);
  const fromSelectionEnd = text.slice(endIndex);
  const selectedContent = text.slice(startIndex, endIndex);

  return (
    untilSelectionStart +
    beforeText +
    selectedContent +
    afterText +
    fromSelectionEnd
  );
}

type StripSurroundTextWithArgs = {
  text: string;
  startIndex: number;
  endIndex: number;
  surroundingText: string;
};

function stripSurroundingText({
  text,
  startIndex,
  endIndex,
  surroundingText,
}: StripSurroundTextWithArgs) {
  const untilSelectionStart = text.slice(0, startIndex);
  const fromSelectionEnd = text.slice(endIndex);
  const selectedContent = text.slice(startIndex, endIndex);

  return (
    untilSelectionStart +
    selectedContent.slice(
      surroundingText.length,
      selectedContent.length - surroundingText.length,
    ) +
    fromSelectionEnd
  );
}
