import { experimental_taintUniqueValue as taintUniqueValue } from "react";
import { _envObject } from "./env-config.mjs";

/**
 * idk why, but sometimes taintUniqueValue doesn't exist
 */
if (taintUniqueValue) {
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
