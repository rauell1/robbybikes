export {};

/**
 * HTTP smoke test for a running Robbybikes instance.
 *
 * Usage:
 *   npm run test:smoke                        # http://localhost:3000
 *   BASE_URL=https://staging.example.com npm run test:smoke
 *
 * Read-only: it fetches public pages and checks that admin routes are gated.
 * It never submits an enquiry, so it is safe to run against staging or
 * production. Expects a migrated database: some checks skip gracefully when
 * the catalogue is empty.
 */

type Check = {
  name: string;
  run: () => Promise<void>;
};

const BASE_URL = (process.env.SMOKE_BASE_URL ?? process.env.BASE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

const checks: Check[] = [];

function check(name: string, run: () => Promise<void>) {
  checks.push({ name, run });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function get(path: string, init?: RequestInit) {
  const response = await fetch(`${BASE_URL}${path}`, {
    redirect: "manual",
    headers: { "user-agent": "robbybikes-smoke-test" },
    ...init,
  });
  const body = await response.text();
  return { response, body };
}

function expectStatus(path: string, body: string, response: Response, expected: number) {
  assert(
    response.status === expected,
    `${path} returned ${response.status}, expected ${expected}${
      body ? ` - ${body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 120)}` : ""
    }`,
  );
}

/* --------------------------------------------------------------- public pages */

const MARKETING_PAGES = [
  ["/", "featured motorcycles"],
  ["/bikes", "motorcycles"],
  ["/brands", "brand"],
  ["/about", "Robbybikes"],
  ["/contact", "0768 462 250"],
  ["/privacy", "privacy"],
  ["/terms", "terms"],
] as const;

for (const [path, expectation] of MARKETING_PAGES) {
  check(`GET ${path} renders`, async () => {
    const { response, body } = await get(path);
    expectStatus(path, body, response, 200);
    assert(body.includes("Robbybikes"), `${path} does not mention the dealership name`);
    assert(
      body.toLowerCase().includes(expectation.toLowerCase()),
      `${path} does not contain expected content "${expectation}"`,
    );
    assert(!body.includes("Application error"), `${path} rendered an application error`);
  });
}

check("homepage publishes AutoDealer structured data", async () => {
  const { body } = await get("/");
  assert(body.includes('"@type":"AutoDealer"'), "AutoDealer JSON-LD is missing");
  assert(body.includes("application/ld+json"), "no JSON-LD script tag on the homepage");
});

check("robots.txt points at the sitemap and blocks the console", async () => {
  const { response, body } = await get("/robots.txt");
  expectStatus("/robots.txt", body, response, 200);
  assert(body.includes("Sitemap:"), "robots.txt has no Sitemap line");
  assert(/Disallow:\s*\/admin/.test(body), "robots.txt does not disallow /admin");
});

check("sitemap.xml lists the main pages", async () => {
  const { response, body } = await get("/sitemap.xml");
  expectStatus("/sitemap.xml", body, response, 200);
  assert(body.includes("<urlset"), "sitemap is not a URL set");
  for (const path of ["/bikes", "/brands", "/about", "/contact"]) {
    assert(body.includes(`${path}</loc>`), `sitemap is missing ${path}`);
  }
});

/* ------------------------------------------------------------- listing pages */

check("a published listing renders with offers and contact actions", async () => {
  const { body: sitemap } = await get("/sitemap.xml");
  const listing = /<loc>[^<]*\/bikes\/([a-z0-9-]+)<\/loc>/.exec(sitemap);
  if (!listing) {
    console.log("      (skipped - no published listings in the sitemap)");
    return;
  }

  const path = `/bikes/${listing[1]}`;
  const { response, body } = await get(path);
  expectStatus(path, body, response, 200);
  assert(body.includes('"@type":"Product"'), "listing has no Product structured data");
  assert(body.includes('"@type":"BreadcrumbList"'), "listing has no breadcrumb structured data");
  assert(body.includes("https://wa.me/"), "listing has no WhatsApp link");
  assert(body.includes("tel:+254"), "listing has no telephone link");
  assert(body.includes("KSh "), "listing does not show a price");
});

check("an unknown listing returns 404", async () => {
  const path = "/bikes/this-listing-does-not-exist-smoke-test";
  const { response, body } = await get(path);
  expectStatus(path, body, response, 404);
});

check("filters and sorting render without errors", async () => {
  for (const path of [
    "/bikes?brand=Bajaj",
    "/bikes?minPrice=80000&maxPrice=200000&sort=price_desc",
    "/bikes?availability=sold",
    "/bikes?condition=excellent",
    "/bikes?q=boxer",
    "/bikes?page=2",
  ]) {
    const { response, body } = await get(path);
    expectStatus(path, body, response, 200);
    assert(!body.includes("Application error"), `${path} rendered an application error`);
  }
});

check("deep-filtered inventory is marked noindex", async () => {
  const { body } = await get("/bikes?brand=Bajaj&minPrice=80000");
  assert(
    /name="robots" content="noindex/.test(body),
    "multi-filter inventory URL is indexable",
  );
});

/* -------------------------------------------------------------- admin gating */

for (const path of ["/admin", "/admin/bikes", "/admin/enquiries", "/admin/bikes/new"]) {
  check(`GET ${path} requires sign-in`, async () => {
    const { response } = await get(path);
    assert(
      response.status === 307 || response.status === 302,
      `${path} returned ${response.status} without a session (expected a redirect)`,
    );
    const location = response.headers.get("location") ?? "";
    assert(location.includes("/admin/login"), `${path} redirected to ${location || "nowhere"}`);
  });
}

check("admin server actions reject anonymous POSTs", async () => {
  const { response } = await get("/admin/bikes", { method: "POST" });
  assert(
    response.status === 307 || response.status === 302 || response.status === 405 || response.status === 403,
    `anonymous POST to /admin/bikes returned ${response.status}`,
  );
});

/* --------------------------------------------------------------------- uploads */

check("the upload endpoint rejects unsafe paths", async () => {
  for (const path of [
    "/api/uploads/does-not-exist.jpg",
    "/api/uploads/..%2F..%2Fpackage.json",
    "/api/uploads/file.svg",
  ]) {
    const { response, body } = await get(path);
    expectStatus(path, body, response, 404);
  }
});

check("admin pages are noindex", async () => {
  const { body } = await get("/admin/login");
  assert(/name="robots" content="noindex/.test(body), "admin login is indexable");
});

/* ---------------------------------------------------------------------- runner */

async function main() {
  let passed = 0;
  const failures: Array<{ name: string; error: unknown }> = [];

  console.log(`Smoke testing ${BASE_URL}\n`);

  for (const { name, run } of checks) {
    try {
      await run();
      passed += 1;
      console.log(`  ✔ ${name}`);
    } catch (error) {
      failures.push({ name, error });
      console.log(`  ✖ ${name}`);
    }
  }

  console.log("");

  if (failures.length > 0) {
    for (const { name, error } of failures) {
      console.error(`✖ ${name}`);
      console.error(`  ${error instanceof Error ? error.message : String(error)}`);
    }
    console.error(`\n✖ ${failures.length} of ${checks.length} checks failed, ${passed} passed.`);
    process.exit(1);
  }

  console.log(`✔ ${passed} checks passed against ${BASE_URL}.`);
}

main().catch((error) => {
  console.error("✖ Smoke test crashed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
