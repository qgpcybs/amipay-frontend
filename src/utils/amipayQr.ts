export type AmiPayQrPayload = {
  version: number;
  chain: string;
  merchant: `0x${string}`;
  token: `0x${string}`;
  amount: string;
  memo?: string;
};

export function parseAmiPayQr(text: string): AmiPayQrPayload | null {
  if (!text) return null;

  const raw = text.trim();

  if (!raw.toLowerCase().startsWith("amipay://")) return null;

  try {
    const url = new URL(raw.replace("amipay://", "http://"));
    const params = url.searchParams;

    const versionStr = params.get("v") ?? "1";
    const chain = params.get("chain") ?? "hoodi";
    const merchant = params.get("merchant") as `0x${string}` | null;
    const token = params.get("token") as `0x${string}` | null;
    const amount = params.get("amount");
    const memo = params.get("memo") || undefined;

    if (!merchant || !token || !amount) return null;

    const version = Number(versionStr);
    return {
      version: Number.isFinite(version) ? version : 1,
      chain,
      merchant,
      token,
      amount,
      memo,
    };
  } catch (e) {
    console.error("parseAmiPayQr failed", e);
    return null;
  }
}
