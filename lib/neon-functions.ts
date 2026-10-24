import "server-only";

export async function callNeonHelloFunction(): Promise<{
  ok: boolean;
  status: number;
  body: string;
}> {
  const url = process.env.NEON_FUNCTION_HELLO_BASE_URL;
  if (!url) {
    throw new Error("NEON_FUNCTION_HELLO_BASE_URL is not configured.");
  }
  const res = await fetch(url);
  const body = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    body,
  };
}
