export const ADDRESS_LABELS: Record<string, string> = {
  "0x1c9cf0e5473914a0e705e8cf0bdd3efbbfe17e48": "Reg Horace",
  "0xc6b1ac76f1a697a3be5a56a9a0dd6d7e418bdca6": "Eat & Sleep",
  "0xd90891f098ee6762c919b110d4830d186c5f6bf4": "7Star",
  "0xbfDC6603DC5938D9d75b580c92b280183D4db020": "Shan Shan",
};

export function shortAddr(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export function getAddressLabel(address?: string | null): string | null {
  if (!address) return null;
  const key = address.toLowerCase();
  return ADDRESS_LABELS[key] ?? null;
}

export function formatAddress(address?: string | null): string {
  if (!address) return "";
  const label = getAddressLabel(address);
  if (label) return label;
  return shortAddr(address);
}
