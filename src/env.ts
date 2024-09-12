import { experimental_taintUniqueValue as taintUniqueValue } from "react";
import { _envObject } from "./env-config.mjs";

/**
 * taintUniqueValue is undefined outside of server components :
 * - in the client & in other call sites
 */
if (process.env.SKIP_ENV_VALIDATION?.toString() !== "1" && taintUniqueValue) {
  taintUniqueValue(
    "Do not pass the DB URL to the client.",
    _envObject,
    _envObject.DATABASE_URL
  );
  taintUniqueValue(
    "Do not pass the session SECRET to the client.",
    _envObject,
    _envObject.SESSION_SECRET
  );

  taintUniqueValue(
    "Do not pass the Github client ID to the client.",
    _envObject,
    _envObject.GITHUB_CLIENT_ID
  );
  taintUniqueValue(
    "Do not pass the Github client secret to the client.",
    _envObject,
    _envObject.GITHUB_SECRET
  );
  taintUniqueValue(
    "Do not pass the Github personnal access token to the client.",
    _envObject,
    _envObject.GITHUB_PERSONAL_ACCESS_TOKEN
  );

  if (_envObject.REDIS_HTTP_PASSWORD) {
    taintUniqueValue(
      "Do not pass REDIS credentials to the client.",
      _envObject,
      _envObject.REDIS_HTTP_PASSWORD
    );
  }
}
export { _envObject as env };
