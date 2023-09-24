import * as React from "react";

export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = React.useState<boolean>(getMatches(query));

  React.useEffect(() => {
    const matchMedia = window.matchMedia(query);

    function handleChange() {
      setMatches(getMatches(query));
    }

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Listen matchMedia
    matchMedia.addEventListener("change", handleChange);

    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, [query]);

  /**
   * This is a hack to not get matches instantly and avoid hydration issues,
   * since `useMediaQuery` does not return anything on the server and will return
   * a value on the client, we do not want to have hydration errors and let first render
   * finish, then we can show the modal.
   */
  const [isFirstRender, setIsFirstRender] = React.useState(true);

  React.useEffect(() => {
    setIsFirstRender(false);
  }, []);

  return !isFirstRender && matches;
}
