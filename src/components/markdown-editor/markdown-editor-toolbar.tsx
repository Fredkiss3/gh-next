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
  DiffIgnoredIcon
} from "@primer/octicons-react";
import { ActionToolbar } from "~/components/action-toolbar";

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
  ref
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
      const isHeading = !!match;

      if (isHeading) {
        const totalMatchedChars = match[0].length;
        const newLineWithoutHeading = (currentLine ?? "").replace(
          /^(#+ ?)/,
          ""
        );

        const result =
          [...allPreviousLines, newLineWithoutHeading].join("\n") +
          fromSelectionStart;

        onTextContentChange(result);
        textArea.setSelectionRange(
          selectionStart - totalMatchedChars,
          selectionEnd - totalMatchedChars
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
          selectionEnd + chars.length
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
              surroundingText: chars
            })
          );
          // keep the selection considering the bold stars removed
          textArea.setSelectionRange(
            selectionStart - chars.length,
            selectionEnd - chars.length
          );
        } else {
          onTextContentChange(
            surroundTextWith({
              text: textContent,
              startIndex: selectionStart,
              endIndex: selectionEnd,
              beforeText: chars
            })
          );
          // keep the selection considering the bold stars added
          textArea.setSelectionRange(
            selectionStart + chars.length,
            selectionEnd + chars.length
          );
        }
      } else {
        const { start, end } = getSelectionStartAndSelectionEnd(
          textContent,
          selectionEnd
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
              surroundingText: chars
            })
          );

          // keep the selection considering the bold stars removed
          textArea.setSelectionRange(
            selectionEnd - chars.length,
            selectionEnd - chars.length
          );
        } else {
          onTextContentChange(
            surroundTextWith({
              text: textContent,
              startIndex: start,
              endIndex: end,
              beforeText: chars
            })
          );

          // keep the selection considering the bold stars added
          textArea.setSelectionRange(
            selectionEnd + chars.length,
            selectionEnd + chars.length
          );
        }
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
        onClick: addOrRemoveHeading
      },
      {
        id: "bold",
        label: "Bold",
        onClick: () => addOrRemoveSurroundingChars("**"),
        icon: BoldIcon
      },
      {
        id: "italic",
        label: "Italic",
        onClick: () => addOrRemoveSurroundingChars("_"),
        icon: ItalicIcon
      },
      {
        id: "quote",
        label: "Quote",
        onClick: () => {},
        icon: QuoteIcon
      },
      {
        id: "code",
        label: "Code",
        onClick: () => addOrRemoveSurroundingChars("`"),
        icon: CodeIcon
      },
      {
        id: "link",
        label: "Link",
        onClick: () => {},
        icon: LinkIcon
      }
    ],
    [
      {
        id: "ordered-list",
        label: "Numbered list",
        onClick: () => {},
        icon: ListOrderedIcon
      },
      {
        id: "unordered-list",
        label: "Unordered list",
        onClick: () => {},
        icon: ListUnorderedIcon
      },
      {
        id: "task-list",
        label: "Task list",
        onClick: () => {},
        icon: TasklistIcon
      }
    ],
    [
      {
        id: "mentions",
        label: "Mentions",
        onClick: () => {},
        icon: MentionIcon
      },
      {
        id: "references",
        label: "References",
        onClick: () => {},
        icon: CrossReferenceIcon
      },
      {
        id: "commands",
        label: "Slash commands",
        onClick: () => {},
        icon: DiffIgnoredIcon
      }
    ]
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
  cursorPosition: number
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
  afterText = beforeText
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
  surroundingText
}: StripSurroundTextWithArgs) {
  const untilSelectionStart = text.slice(0, startIndex);
  const fromSelectionEnd = text.slice(endIndex);
  const selectedContent = text.slice(startIndex, endIndex);

  return (
    untilSelectionStart +
    selectedContent.slice(
      surroundingText.length,
      selectedContent.length - surroundingText.length
    ) +
    fromSelectionEnd
  );
}
