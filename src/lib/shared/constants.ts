export const FLASH_COOKIE_KEY = "__flash";
export const SESSION_COOKIE_KEY = "__id";
export const LOGGED_OUT_SESSION_TTL = 1 * 24 * 60 * 60; // 1 day in seconds
export const LOGGED_IN_SESSION_TTL = 2 * 24 * 60 * 60; // 2 days in seconds

export const DEFAULT_CACHE_TTL = 1 * 24 * 60 * 60; // 1 day in seconds
export const GITHUB_REPOSITORY_CACHE_KEY = "github:repository";

export const GITHUB_AUTHOR_USERNAME = "Fredkiss3";
export const GITHUB_REPOSITORY_NAME = "gh-next";
export const AUTHOR_AVATAR_URL =
  "https://avatars.githubusercontent.com/u/38298743?v=4";

export const SORT_FILTERS = [
  "created-desc",
  "created-asc",
  "comments-asc",
  "comments-desc",
  "updated-asc",
  "updated-desc",
  "relevance-desc",
  "reactions-+1-desc",
  "reactions--1-desc",
  "reactions-smile-desc",
  "reactions-tada-desc",
  "reactions-thinking_face-desc",
  "reactions-heart-desc",
  "reactions-rocket-desc",
  "reactions-eyes-desc",
] as const;

export const IN_FILTERS = ["title", "body", "comments"] as const;
export const STATUS_FILTERS = ["open", "closed"] as const;
export const NO_METADATA_FILTERS = ["label", "assignee"] as const;
