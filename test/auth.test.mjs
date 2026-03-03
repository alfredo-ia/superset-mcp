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
      sessionCookie: this.config.sessionCookie,
      csrfToken: this.csrfToken,
    };
  }
}

test("authenticate exige SUPERSET_SESSION_COOKIE quando não configurado", async () => {
  const client = new TestSupersetClient({
    baseUrl: "https://superset.example.com",
  });

  await assert.rejects(
    client.authenticate(),
    /SUPERSET_SESSION_COOKIE required/,
  );
});

test("authenticate aceita SUPERSET_SESSION_COOKIE e SUPERSET_CSRF_TOKEN sem exigir outras credenciais", async () => {
  const client = new TestSupersetClient({
    baseUrl: "https://superset.example.com",
    sessionCookie: "session=abc123",
    csrfToken: "csrf-xyz",
  });

  let loginCalled = false;
  client.setPostHandler(async () => {
    loginCalled = true;
    return { data: { access_token: "unexpected" } };
  });

  await client.authenticate();

  const state = client.getState();
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.sessionCookie, "session=abc123");
  assert.equal(state.csrfToken, "csrf-xyz");
  assert.equal(loginCalled, false);
});

test("authenticate normaliza SUPERSET_SESSION_COOKIE sem prefixo session=", async () => {
  const client = new TestSupersetClient({
    baseUrl: "https://superset.example.com",
    sessionCookie: "abc123",
  });

  await client.authenticate();

  const state = client.getState();
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.sessionCookie, "session=abc123");
});
