import test from "node:test";
import assert from "node:assert/strict";
import worker, { normaliseEmail, normaliseSite, sha256 } from "../src/index.js";

const KEY = "RSSP-1234-5678-ABCD";
const EMAIL = "buyer@example.com";

class FakeDB {
  constructor(licence, count = 2) {
    this.licence = licence;
    this.count = count;
  }
  prepare(sql) {
    const db = this;
    return {
      args: [],
      bind(...args) { this.args = args; return this; },
      async first() {
        if (sql.includes("SELECT id, product_id")) {
          const [keyHash, emailHash, product] = this.args;
          if (keyHash === await sha256(KEY) &&
              emailHash === await sha256(EMAIL) &&
              product === "rss-prism-premium") return db.licence;
          return null;
        }
        if (sql.includes("COUNT(*) AS count")) return { count: db.count };
        return null;
      },
      async run() { return { meta: { changes: 0 } }; }
    };
  }
}

function license(overrides = {}) {
  return {
    id: "lic_test_1",
    product_id: "rss-prism-premium",
    status: "active",
    activation_limit: 5,
    starts_at: "2026-01-01T00:00:00.000Z",
    expires_at: "2099-01-01T00:00:00.000Z",
    ...overrides
  };
}
function request(path, body, method = "POST") {
  return new Request("https://licensing.example.test" + path, {
    method,
    headers: { "content-type": "application/json" },
    body: method === "GET" ? undefined : JSON.stringify(body)
  });
}

test("normalises purchase email and site identity", () => {
  assert.equal(normaliseEmail(" Buyer@Example.com "), "buyer@example.com");
  assert.equal(normaliseSite("https://www.Example.com/shop/?x=1#top"), "example.com/shop");
});
test("health endpoint responds without database access", async () => {
  const response = await worker.fetch(request("/health", {}, "GET"), {});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).ok, true);
});
test("matching licence key and purchase email returns limit and validity", async () => {
  const response = await worker.fetch(request("/v1/license/verify", {
    license_key: KEY, email: " BUYER@example.com ", product_id: "rss-prism-premium"
  }), { DB: new FakeDB(license(), 3) });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    valid: true,
    product_id: "rss-prism-premium",
    status: "active",
    activation_limit: 5,
    active_activations: 3,
    valid_until: "2099-01-01T00:00:00.000Z"
  });
});
test("wrong email cannot verify an otherwise valid key", async () => {
  const response = await worker.fetch(request("/v1/license/verify", {
    license_key: KEY, email: "attacker@example.com", product_id: "rss-prism-premium"
  }), { DB: new FakeDB(license()) });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).valid, false);
});
test("expired, not-yet-valid and revoked licences are denied", async (t) => {
  for (const [label, data] of [
    ["expired", license({ expires_at: "2000-01-01T00:00:00.000Z" })],
    ["not yet valid", license({ starts_at: "2999-01-01T00:00:00.000Z" })],
    ["revoked", license({ status: "revoked" })]
  ]) {
    await t.test(label, async () => {
      const response = await worker.fetch(request("/v1/license/verify", {
        license_key: KEY, email: EMAIL, product_id: "rss-prism-premium"
      }), { DB: new FakeDB(data) });
      assert.equal(response.status, 403);
    });
  }
});
test("invalid input is rejected before database access", async () => {
  const response = await worker.fetch(request("/v1/license/verify", {
    license_key: "bad", email: EMAIL, product_id: "rss-prism-premium"
  }), { DB: new FakeDB(license()) });
  assert.equal(response.status, 400);
});
test("unsupported product is rejected", async () => {
  const response = await worker.fetch(request("/v1/license/verify", {
    license_key: KEY, email: EMAIL, product_id: "other-product"
  }), { DB: new FakeDB(license()) });
  assert.equal(response.status, 400);
});