import "server-only";

export async function checkAIGateway(): Promise<{
  ok: boolean;
  status: number;
  available: boolean;
  message?: string;
  recoveryUrl?: string;
  data?: unknown;
}> {
  const baseUrl = process.env.NEON_AI_GATEWAY_BASE_URL;
  const token = process.env.NEON_AI_GATEWAY_TOKEN;

  if (!baseUrl || !token) {
    return {
      ok: false,
      status: 0,
      available: false,
      message: "NEON_AI_GATEWAY_BASE_URL or NEON_AI_GATEWAY_TOKEN is not configured.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/v1/models`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        available: false,
        message: body?.error?.message || "AI Gateway request failed",
        recoveryUrl: body?.error?.recovery_url,
      };
    }

    const available = body?.request_context_availability?.http?.status !== "unavailable";
    const unavailableReason = body?.request_context_availability?.http?.reason;

    return {
      ok: true,
      status: res.status,
      available,
      message: available
        ? "AI Gateway is ready and operational."
        : `AI Gateway requires a paid plan (${unavailableReason || "paid_plan_required"}).`,
      recoveryUrl: body?.recovery_url,
      data: {
        modelCount: Array.isArray(body?.data) ? body.data.length : 0,
        availability: body?.request_context_availability,
      },
    };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      available: false,
      message: error instanceof Error ? error.message : "Unknown error connecting to AI Gateway",
    };
  }
}
