// Uptime monitors call this. Static, so it is served from cache with no database work.
export const dynamic = "force-static";

export function GET() {
  return new Response("ok", { headers: { "content-type": "text/plain" } });
}
