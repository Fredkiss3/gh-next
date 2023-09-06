import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvents from "@testing-library/user-event";
import { Button, DEFAULT_LOADING_MESSAGE, type Variant } from "../button";
import { DummyIcon } from "./mocks/dummy-icon";

const buttonNodeTypeMap = {
  svg: 1,
  text: 3,
};

function getButtonNodesPosition(container: HTMLElement) {
  return Array.from(container.childNodes).reduce(
    (nodeValueMap, child, i) => {
      if (buttonNodeTypeMap.svg === child.nodeType) {
        nodeValueMap.svg = i;
      } else if (buttonNodeTypeMap.text === child.nodeType) {
        nodeValueMap.text = i;
      }
      return nodeValueMap;
    },
    {
      svg: -1,
      text: -1,
    }
  );
}

function hasClasses(classes: string, classList: DOMTokenList) {
  return classes.split(" ").every((className) => classList.contains(className));
}

function checkButtonVariantClass(container: HTMLElement, variant: Variant) {
  const classList = container.classList;

  switch (variant) {
    case "primary":
      return hasClasses("bg-success text-white shadow-subtle", classList);

    case "ghost":
      return hasClasses(
        "hover:border-neutral focus:border-neutral focus-visible:border-accent focus-visible:!border-2 focus-visible:outline-none !border text-foreground",
        classList
      );

    case "accent-ghost":
      console.log({ class: classList.toString() });
      return hasClasses(
        "text-accent border-transparent !border hover:border-grey focus:border-transparent focus-visible:border-transparent focus:!ring-2 focus:ring-accent focus-visible:ring-accent aria-[current]:bg-accent aria-[current]:text-white aria-[current]:border-accent",
        classList
      );
    case "invisible":
      return hasClasses(
        "bg-transparent text-grey border-neutral !border hover:bg-subtle hover:border-grey aria-[current]:bg-subtle aria-[current]:border-grey focus-visible:ring-2 focus-visible:ring-accent focus:ring-2 focus:ring-accent",
        classList
      );
    case "secondary":
      return hasClasses(
        "bg-subtle text-accent border-neutral hover:bg-accent hover:text-white hover:border-accent aria-[current]:bg-accent aria-[current]:text-white aria-[current]:border-accent",
        classList
      );
    case "danger":
      return hasClasses(
        "hover:bg-danger hover:text-white hover:border-danger aria-[current]:bg-danger aria-[current]:text-white aria-[current]:border-danger",
        classList
      );
    case "subtle":
      return hasClasses(
        "bg-ghost text-foreground/70 border-neutral !border shadow-sm hover:border-grey aria-[current]:border-grey",
        classList
      );
    default:
      return false;
  }
}
describe("Button", () => {
  test("should render link correctly when href is passed as prop", () => {
    const redirectRoute = "/new-test-route";
    const buttonText = "test link";
    render(<Button href={redirectRoute}>{buttonText}</Button>);

    const link = screen.getByText(buttonText);

    expect(link).toMatchInlineSnapshot(`
      <a
        class="react-aria-Link items-center justify-center gap-2  rounded-md border-2 font-medium outline-accent border-gray-900/10 transition duration-150 disabled:opacity-50 focus-visible:outline-none inline-flex py-1.5 px-3 bg-success text-white shadow-subtle"
        href="/new-test-route"
      >
        test link
      </a>
    `);
  });
  test("should render button correctly", () => {
    const buttonText = "test button";
    render(<Button>{buttonText}</Button>);

    const link = screen.getByText(buttonText);

    expect(link).toMatchInlineSnapshot(`
      <button
        class="items-center justify-center gap-2  rounded-md border-2 font-medium outline-accent border-gray-900/10 transition duration-150 disabled:opacity-50 focus-visible:outline-none inline-flex py-1.5 px-3 bg-success text-white shadow-subtle focus-visible:outline focus-visible:-outline-offset-2 focus:outline focus:-outline-offset-2 [&[aria-pressed=true]]:outline [&[aria-pressed=true]]:-outline-offset-2 focus-visible:shadow-inset focus:shadow-inset [&[aria-pressed=true]]:shadow-inset"
        type="button"
      >
        <span
          aria-live="assertive"
          class="sr-only"
        />
        test button
      </button>
    `);
  });
  describe("with", () => {
    const buttonText = "test link";
    const href = "/test-route";

    const buttonWithLeadingIcon = (
      <Button renderLeadingIcon={(cls) => <DummyIcon className={cls} />}>
        {buttonText}
      </Button>
    );
    const buttonWithTrailingIcon = (
      <Button renderTrailingIcon={(cls) => <DummyIcon className={cls} />}>
        {buttonText}
      </Button>
    );

    const linkButtonWithLeadingIcon = (
      <Button
        href={href}
        renderLeadingIcon={(cls) => <DummyIcon className={cls} />}
      >
        {buttonText}
      </Button>
    );
    const linkButtonWithTrailingIcon = (
      <Button
        href={href}
        renderTrailingIcon={(cls) => <DummyIcon className={cls} />}
      >
        {buttonText}
      </Button>
    );

    test.each([
      { name: "leading icon button", component: buttonWithLeadingIcon },
      { name: "trailing icon button", component: buttonWithTrailingIcon },
      { name: "leading icon link", component: linkButtonWithLeadingIcon },
      { name: "trailing icon link", component: linkButtonWithTrailingIcon },
    ])("--> $name", ({ name, component }) => {
      render(component);
      const container = screen.getByText(buttonText);
      const { svg, text } = getButtonNodesPosition(container);

      if (name.includes("leading icon")) expect(svg).toBeLessThan(text);
      if (name.includes("trailing icon")) expect(svg).toBeGreaterThan(text);
    });
  });

  test("should render squared button", () => {
    const buttonText = "test link";
    render(<Button isSquared>{buttonText}</Button>);

    const button = screen.getByText(buttonText);

    expect(button.classList.contains("p-2")).toBe(true);
    expect(button.classList.contains("py-1.5 px-3")).toBe(false);
  });
  test("should render default loading message while loading", () => {
    const buttonText = "test button";
    const onClickMock = vi.fn();
    render(
      <Button isLoading={true} onClick={onClickMock}>
        {buttonText}
      </Button>
    );

    const button = screen.getByText(buttonText);
    const loader = screen.getByText(DEFAULT_LOADING_MESSAGE);
    userEvents.click(button);

    expect(loader).toBeTruthy();
    expect(onClickMock).not.toHaveBeenCalled();
    expect(loader.getAttribute("aria-live")).toBe("assertive");
    expect(button.classList.contains("cursor-default")).toBe(true);
  });
  test("should render custom loading message while loading", () => {
    const buttonText = "test button";
    const loadingTestMessage = "loading button";
    const onClickMock = vi.fn();
    render(
      <Button
        isLoading={true}
        loadingMessage={loadingTestMessage}
        onClick={onClickMock}
      >
        {buttonText}
      </Button>
    );

    const button = screen.getByText(buttonText);
    const loader = screen.getByText(loadingTestMessage);
    userEvents.click(button);

    expect(loader).toBeTruthy();
    expect(onClickMock).not.toHaveBeenCalled();
    expect(loader.getAttribute("aria-live")).toBe("assertive");
    expect(button.classList.contains("cursor-default")).toBe(true);
  });
  describe("for", () => {
    test.each([
      { name: "primary variant link", variant: "primary", type: "link" },
      { name: "primary variant button", variant: "primary", type: "button" },
      { name: "secondary variant link", variant: "secondary", type: "link" },
      {
        name: "secondary variant button",
        variant: "secondary",
        type: "button",
      },
      {
        name: "accent-ghost variant link",
        variant: "accent-ghost",
        type: "link",
      },
      {
        name: "accent-ghost variant button",
        variant: "accent-ghost",
        type: "button",
      },
      { name: "ghost variant link", variant: "ghost", type: "link" },
      { name: "ghost variant button", variant: "ghost", type: "button" },
      { name: "danger variant link", variant: "danger", type: "link" },
      { name: "danger variant button", variant: "danger", type: "button" },
      { name: "invisible variant link", variant: "danger", type: "link" },
      { name: "invisible variant button", variant: "danger", type: "button" },
      { name: "subtle variant link", variant: "subtle", type: "link" },
      { name: "subtle variant button", variant: "subtle", type: "button" },
    ])("--> $name", ({ variant, type }) => {
      const buttonText = "Test button";
      const buttonLink = "/test-link";
      if (type === "button") {
        render(<Button variant={variant as Variant}>{buttonText}</Button>);
      } else {
        render(
          <Button href={buttonLink} variant={variant as Variant}>
            {buttonText}
          </Button>
        );
      }

      const button = screen.getByText(buttonText);

      expect(checkButtonVariantClass(button, variant as Variant)).toBe(true);
    });
  });
});
