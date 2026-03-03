import test from "node:test";
import assert from "node:assert/strict";
import { AxiosError } from "axios";

import { getErrorMessage } from "../build/utils/error.js";
import { initializeSupersetClient } from "../build/client/index.js";
import { handleDatasetTool } from "../build/handlers/dataset-handlers.js";

function createUnauthorizedAxiosError(message = "Session expired") {
  return new AxiosError(
    "Request failed with status code 401",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      data: { message },
      status: 401,
      statusText: "UNAUTHORIZED",
      headers: { "content-type": "application/json" },
      config: {
        headers: {},
      },
    },
  );
}

test("getErrorMessage informa cookie expirado quando Superset retorna 401", () => {
  const error = createUnauthorizedAxiosError();
  const text = getErrorMessage(error);

  assert.match(text, /Invalid or expired session cookie/i);
  assert.match(text, /SUPERSET_SESSION_COOKIE/i);
});

test("handleDatasetTool repassa mensagem amigável de cookie expirado", async () => {
  const client = initializeSupersetClient();
  client.datasets.getDatasets = async () => {
    throw createUnauthorizedAxiosError();
  };

  const result = await handleDatasetTool("list_datasets", {});
  const text = result.content?.[0]?.text ?? "";

  assert.equal(result.isError, true);
  assert.match(text, /Invalid or expired session cookie/i);
  assert.match(text, /SUPERSET_SESSION_COOKIE/i);
});
