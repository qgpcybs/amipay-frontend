// src/components/PaymentPrioritySheet.tsx
import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { formatUnits, parseAbiItem } from "viem";
import {
  AMIPAY_ADDRESS,
  USDC_ADDRESS,
  amiPayAbi,
  erc20Abi,
} from "../chainConfig";

interface PaymentPrioritySheetProps {
  open: boolean;
  onClose: () => void;
}

type EntryId = "SELF" | `0x${string}`;

interface Entry {
  id: EntryId;
  label: string;
  subtitle?: string;
}

function loadOrder(address: string | undefined): EntryId[] {
  if (!address) return [];
  try {
    const raw = window.localStorage.getItem(
      `amipay-priority-${address.toLowerCase()}`
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EntryId[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveOrder(address: string | undefined, order: EntryId[]) {
  if (!address) return;
  window.localStorage.setItem(
    `amipay-priority-${address.toLowerCase()}`,
    JSON.stringify(order)
  );
}

export function PaymentPrioritySheet({
  open,
  onClose,
}: PaymentPrioritySheetProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [sponsors, setSponsors] = useState<`0x${string}`[]>([]);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);

  // USDC decimals
  const { data: usdcDecimals } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
  });

  // load sponsor list & allowance
  useEffect(() => {
    if (!open || !address || !publicClient) return;

    (async () => {
      try {
        setLoading(true);

        // Figure out sponsor
        const event = parseAbiItem(
          "event AllowanceDeposited(address indexed sponsor, address indexed beneficiary, uint256 amount)"
        );

        const logs = await publicClient.getLogs({
          address: AMIPAY_ADDRESS as `0x${string}`,
          event,
          args: { beneficiary: address as `0x${string}` },
          fromBlock: 0n,
          toBlock: "latest",
        });

        const sponsorSet = new Set<`0x${string}`>();
        for (const log of logs) {
          const s = log.args.sponsor as `0x${string}`;
          sponsorSet.add(s);
        }
        const sponsorList = Array.from(sponsorSet);
        setSponsors(sponsorList);

        // check sponsor allowance
        const sponsorEntries: Entry[] = [];
        for (const s of sponsorList) {
          const raw = (await publicClient.readContract({
            address: AMIPAY_ADDRESS as `0x${string}`,
            abi: amiPayAbi,
            functionName: "allowances",
            args: [address as `0x${string}`, s],
          })) as bigint;

          const formatted =
            raw && usdcDecimals != null
              ? Number(formatUnits(raw, Number(usdcDecimals))).toFixed(2)
              : "0.00";

          sponsorEntries.push({
            id: s,
            label: shortAddr(s),
            subtitle: `Balance ${formatted} USDC`,
          });
        }

        // order the list
        const saved = loadOrder(address);
        const defaultOrder: EntryId[] = ["SELF", ...sponsorList];

        const finalOrder = defaultOrder.slice().sort((a, b) => {
          const ia = saved.indexOf(a);
          const ib = saved.indexOf(b);
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });

        const allEntries: Entry[] = finalOrder.map((id) => {
          if (id === "SELF") {
            return {
              id,
              label: "Use my own wallet",
              subtitle: "",
            };
          }
          const found = sponsorEntries.find((e) => e.id === id);
          return (
            found ?? {
              id,
              label: shortAddr(id),
              subtitle: "Amig@",
            }
          );
        });

        setEntries(allEntries);
      } catch (err) {
        console.error("load payment priority failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, address, publicClient, usdcDecimals]);

  const moveToTop = (id: EntryId) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx <= 0) return prev;
      const cloned = [...prev];
      const [item] = cloned.splice(idx, 1);
      cloned.unshift(item);
      const order = cloned.map((e) => e.id);
      saveOrder(address, order);
      return cloned;
    });
  };

  const visibleEntries = useMemo(() => entries, [entries]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
      }}
      onClick={onClose}>
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#111",
          color: "#f5f5f5",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 16,
          boxShadow: "0 -10px 30px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 999,
            background: "#333",
            margin: "0 auto 12px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            alignItems: "center",
          }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Payment priority</h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              cursor: "pointer",
              background: "#222",
              color: "#eee",
            }}>
            Done
          </button>
        </div>

        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>
          The order below decides which source of funds will be used first when
          you pay. You can pin your favorite sponsors – or your own wallet – to
          the top.
        </p>

        {loading ? (
          <div style={{ fontSize: 13, color: "#aaa", padding: "8px 0" }}>
            Loading your amig@s
          </div>
        ) : visibleEntries.length === 0 ? (
          <div style={{ fontSize: 13, color: "#aaa", padding: "8px 0" }}>
            No amig@s yet. You can still pay directly with your own wallet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {visibleEntries.map((entry, index) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 999,
                  background: index === 0 ? "#222" : "#181818",
                }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: index === 0 ? 600 : 500,
                    }}>
                    {index + 1}. {entry.label}
                  </span>
                  {entry.subtitle && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#888",
                        marginTop: 2,
                      }}>
                      {entry.subtitle}
                    </span>
                  )}
                </div>
                {index !== 0 && (
                  <button
                    onClick={() => moveToTop(entry.id)}
                    style={{
                      border: "none",
                      borderRadius: 999,
                      padding: "4px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                      background: "#ff70c8",
                      color: "#111",
                      fontWeight: 600,
                    }}>
                    Pin
                  </button>
                )}
                {index === 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#ff9ae0",
                      fontWeight: 600,
                    }}>
                    Top priority
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function shortAddr(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}
