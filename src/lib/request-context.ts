import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  const forwardHeader = hdrs.get("x-forwarded-for");
  if (forwardHeader) {
    return forwardHeader.split(",")[0]?.trim() ?? "unknown";
  }
  const realIp = hdrs.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return (request as unknown as { ip?: string }).ip ?? "unknown";
}
