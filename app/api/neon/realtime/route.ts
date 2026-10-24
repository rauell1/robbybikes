import { NextResponse } from "next/server";
import { sealMotorcyclesLiveQuery } from "@/lib/neon-realtime";

export async function GET() {
  const result = await sealMotorcyclesLiveQuery();
  return NextResponse.json(result);
}
