import { usePathname } from "next/navigation";
import { linkWithSlash } from "~/lib/functions";

export function useActiveLink(href: string) {
  const path = usePathname();

  // treat `/` as special or else it would always be considered active
  // as every path starts with `/`
  const url = new URL(href, "http://localhost");
  if (url.pathname === "/" && url.pathname !== path) {
    return false;
  }

  return linkWithSlash(path).startsWith(linkWithSlash(href));
}
