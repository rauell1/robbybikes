import { neonAuth } from "@/lib/neon-auth";
import { NextResponse } from "next/server";

const handler = neonAuth ? neonAuth.handler() : null;

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!handler) {
    return NextResponse.json({ error: "Neon Auth not configured" }, { status: 503 });
  }
  return handler.GET(request, context);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!handler) {
    return NextResponse.json({ error: "Neon Auth not configured" }, { status: 503 });
  }
  return handler.POST(request, context);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!handler) {
    return NextResponse.json({ error: "Neon Auth not configured" }, { status: 503 });
  }
  return handler.PUT(request, context);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!handler) {
    return NextResponse.json({ error: "Neon Auth not configured" }, { status: 503 });
  }
  return handler.DELETE(request, context);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!handler) {
    return NextResponse.json({ error: "Neon Auth not configured" }, { status: 503 });
  }
  return handler.PATCH(request, context);
}
