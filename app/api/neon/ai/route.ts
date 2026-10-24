import { NextResponse } from "next/server";
import { checkAIGateway } from "@/lib/neon-ai-gateway";

export async function GET() {
  const result = await checkAIGateway();
  return NextResponse.json(result);
}
