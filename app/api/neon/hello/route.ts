import { NextResponse } from "next/server";
import { callNeonHelloFunction } from "@/lib/neon-functions";

export async function GET() {
  try {
    const result = await callNeonHelloFunction();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
