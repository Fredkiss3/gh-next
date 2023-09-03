import { afterAll, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, type AvatarProps } from "../avatar";

vi.mock("next/image", () => ({
  /* eslint-disable  */
  // eslint-disable-next-line @next/next/no-img-element jsx-a11y/alt-text
  default: (props: AvatarProps) => <img {...props} />,
}));

afterAll(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

const expectToHaveClasses = (classes: string[], classList: DOMTokenList) =>
  classes.forEach((className) =>
    expect(classList.contains(className)).toBe(true)
  );

describe("Avatar", () => {
  const username = "john";
  const src = "./mocks/shoe.jpg";
  test("should render img correctly with default size medium", () => {
    render(<Avatar src={src} username={username} />);

    const img = screen.getByAltText(`@${username}`);
    const defaultClass = ["rounded-full", "flex-shrink-0", "h-10", "w-10"];

    expectToHaveClasses(defaultClass, img.classList);

    expect(img.getAttribute("src")).toBe(src);
    expect(img.getAttribute("height")).toBe("128");
    expect(img.getAttribute("width")).toBe("128");
  });
  test("should render with with large size", () => {
    render(<Avatar src={src} username={username} size="large" />);

    const img = screen.getByAltText(`@${username}`);
    const largeImgClasses = ["h-16", "w-16"];

    expectToHaveClasses(largeImgClasses, img.classList);
  });
  test("should render with with small size", () => {
    render(<Avatar src={src} username={username} size="small" />);

    const img = screen.getByAltText(`@${username}`);
    const smallImgClasses = ["h-6", "w-6"];

    expectToHaveClasses(smallImgClasses, img.classList);
  });
});
