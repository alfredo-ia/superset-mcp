import test from "node:test";
import assert from "node:assert/strict";
import { BaseSuperset } from "../build/client/base-client.js";

class TestSupersetClient extends BaseSuperset {
  setPostHandler(handler) {
    this.api.post = handler;
  }

  getState() {
    return {
      isAuthenticated: this.isAuthenticated,
      accessToken: this.config.accessToken,
    };
  }
}

test("authenticate aceita SUPERSET_ACCESS_TOKEN sem username/password", async () => {
  const client = new TestSupersetClient({
    baseUrl: "https://superset.example.com",
    accessToken: "token-from-env",
  });

  let loginCalled = false;
  client.setPostHandler(async () => {
    loginCalled = true;
    return { data: { access_token: "unexpected" } };
  });

  await client.authenticate();

  const state = client.getState();
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.accessToken, "token-from-env");
  assert.equal(loginCalled, false);
});

test("authenticate usa SUPERSET_ACCESS_TOKEN_COMMAND para obter token", async () => {
  const client = new TestSupersetClient({
    baseUrl: "https://superset.example.com",
    accessTokenCommand: "node -e \"process.stdout.write('command-token')\"",
  });

  let loginCalled = false;
  client.setPostHandler(async () => {
    loginCalled = true;
    return { data: { access_token: "unexpected" } };
  });

  await client.authenticate();

  const state = client.getState();
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.accessToken, "command-token");
  assert.equal(loginCalled, false);
});
