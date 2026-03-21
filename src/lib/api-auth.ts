import { NextRequest } from "next/server";

export function requireApiKey(req: NextRequest): boolean {
  const key = req.headers.get("x-api-key");
  return key === process.env.PLATFORM_API_KEY && !!key;
}
