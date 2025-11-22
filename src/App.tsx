import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ScanModal } from "./components/ScanModal";
import { formatUnits, parseUnits } from "viem";
import {
  USDC_ADDRESS,
  AMIPAY_ADDRESS,
  erc20Abi,
  amiPayAbi,
} from "./chainConfig";
import { waitForTransactionReceipt } from "wagmi/actions";
import { wagmiConfig } from "./wagmiConfig";
import { PaymentPrioritySheet } from './components/PaymentPrioritySheet';

function App() {
  const { address, isConnected } = useAccount();
  const [scanOpen, setScanOpen] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const { data: usdcDecimals } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
  });

  const {
    data: rawBalance,
    refetch: refetchBalance,
    isFetching: isFetchingBalance,
  } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const displayBalance =
    rawBalance && usdcDecimals != null
      ? Number(
          formatUnits(rawBalance as bigint, usdcDecimals as number)
        ).toFixed(2)
      : "0.00";

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  const [beneficiaryInput, setBeneficiaryInput] = useState("");
  const [depositAmountInput, setDepositAmountInput] = useState("");
  const [funding, setFunding] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);
  const [lastDepositHash, setLastDepositHash] = useState<
    `0x${string}` | undefined
  >(undefined);

  const { writeContractAsync } = useWriteContract();

  const { isLoading: waitingDepositConfirm, isSuccess: depositConfirmed } =
    useWaitForTransactionReceipt({
      hash: lastDepositHash,
      confirmations: 1,
    });

  useEffect(() => {
    if (depositConfirmed) {
      (async () => {
        await new Promise((r) => setTimeout(r, 700));
        await refetchBalance();
      })();
    }
  }, [depositConfirmed, refetchBalance]);

  return (
    <div
      style={{
        height: "100vh",
        background: "#f9f4f0",
        color: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
      <header
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "16px 20px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <ConnectButton showBalance={false} />
      </header>
      <main
        style={{
          width: "100%",
          maxWidth: 480,
          flex: 1,
          padding: "0 16px 80px",
          boxSizing: "border-box",
        }}>
        <div
          style={{
            background: "#f9f1f7",
            color: "#111",
            borderRadius: 24,
            padding: 16,
            marginTop: 8,
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}></div>
          {/* Add & Withdraw Button */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button style={pillButtonStyle} onClick={() => alert("Just mock")}>
              ↓ Add
            </button>
            <button style={pillButtonStyle} onClick={() => alert("Just mock")}>
              ↑ Withdraw
            </button>
            <button
              style={pillButtonStyle}
              onClick={() => setPriorityOpen(true)}>
              Setting
            </button>
          </div>
          {/* Balance */}
          <div style={{ fontSize: 36, fontWeight: 700, margin: "8px 0" }}>
            {isFetchingBalance ? (
              <span style={{ fontSize: 18, color: "#aaa" }}>Updating…</span>
            ) : (
              <>${displayBalance}</>
            )}
          </div>
          {/* Send & Request Button */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{ ...pillButtonStyle, flex: 1, background: "#ff70c8" }}
              onClick={() => alert("Just mock")}>
              ↗ Send
            </button>
            <button
              style={{ ...pillButtonStyle, flex: 1, background: "#ffd3f1" }}
              onClick={() => alert("Just mock")}>
              ↙ Request
            </button>
          </div>
        </div>
        {/* Amig@s */}
        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Sponsor friends</h2>
          <div
            style={{
              background: "#181818",
              borderRadius: 16,
              padding: 12,
              fontSize: 13,
              display: "grid",
              gap: 8,
            }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span>Friend address</span>
              <input
                style={inputStyle}
                placeholder="0x..."
                value={beneficiaryInput}
                onChange={(e) => setBeneficiaryInput(e.target.value)}
              />
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span>Amount (USDC)</span>
              <input
                style={inputStyle}
                placeholder="0.00"
                value={depositAmountInput}
                onChange={(e) => setDepositAmountInput(e.target.value)}
              />
            </label>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 4,
              }}>
              <button
                style={{
                  ...pillButtonStyle,
                  marginTop: 4,
                  background: "#ff70c8",
                }}
                disabled={
                  !isConnected ||
                  !beneficiaryInput ||
                  !depositAmountInput ||
                  !usdcDecimals ||
                  funding ||
                  waitingDepositConfirm
                }
                // Give a hand
                onClick={async () => {
                  if (!address || !usdcDecimals) return;
                  try {
                    setFunding(true);
                    setFundError(null);
                    const amount = parseUnits(
                      depositAmountInput || "0",
                      Number(usdcDecimals)
                    );
                    const approveHash = await writeContractAsync({
                      address: USDC_ADDRESS as `0x${string}`,
                      abi: erc20Abi,
                      functionName: "approve",
                      args: [AMIPAY_ADDRESS as `0x${string}`, amount],
                    });

                    await waitForTransactionReceipt(wagmiConfig, {
                      hash: approveHash as `0x${string}`,
                      confirmations: 1,
                    });

                    const depositHash = await writeContractAsync({
                      address: AMIPAY_ADDRESS as `0x${string}`,
                      abi: amiPayAbi,
                      functionName: "depositAllowance",
                      args: [beneficiaryInput as `0x${string}`, amount],
                    });

                    setDepositAmountInput("");
                    setLastDepositHash(depositHash as `0x${string}`);
                  } catch (e: any) {
                    // console.error("fund failed", e);
                    const msg = e?.shortMessage || e?.message || "";
                    // console.log(msg);
                    if (
                      msg.includes("RPC endpoint not found") ||
                      msg.includes("Failed to fetch") ||
                      msg.includes("Network error") ||
                      msg.includes("timeout")
                    ) {
                      setFundError(
                        "The RPC node may be unstable. Please try again."
                      );
                    } else {
                      setFundError(
                        "Transaction failed. Please check the details and try again."
                      );
                    }
                  } finally {
                    setFunding(false);
                  }
                }}>
                {funding
                  ? "Giving… (check wallet)"
                  : waitingDepositConfirm
                  ? "Sending on-chain…"
                  : "Give a hand"}
              </button>
            </div>
            {(fundError || waitingDepositConfirm) && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#f97373",
                }}>
                {waitingDepositConfirm && !fundError && (
                  <span style={{ color: "#e5e5e5" }}>
                    Awaiting block confirmation...
                  </span>
                )}
                {fundError && (
                  <span style={{ color: "#f97373" }}>{fundError}</span>
                )}
              </div>
            )}
          </div>
        </section>
        {/* Activity */}
        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Activity</h2>
          <div
            style={{
              background: "#181818",
              borderRadius: 16,
              padding: 12,
              fontSize: 13,
            }}>
            {lastScanned ? (
              <>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Last scanned QR
                </div>
                <div style={{ wordBreak: "break-all", color: "#ddd" }}>
                  {lastScanned}
                </div>
              </>
            ) : (
              <div style={{ color: "#777" }}>
                No activity yet. Try scanning a QR.
              </div>
            )}
          </div>
        </section>
      </main>
      <footer
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: 72,
          background: "#181818",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}>
        <button style={navButtonStyle}>🏠 Home</button>
        <button
          onClick={() => setScanOpen(true)}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#ff70c8",
            border: "4px solid #111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            marginTop: -32,
            boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
            cursor: "pointer",
          }}>
          📷
        </button>
        <button style={navButtonStyle}>💬 Support</button>
      </footer>
      <ScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onResult={(text) => setLastScanned(text)}
      />
      <PaymentPrioritySheet
        open={priorityOpen}
        onClose={() => setPriorityOpen(false)}
      />
    </div>
  );
}

const pillButtonStyle: React.CSSProperties = {
  flex: 1,
  borderRadius: 999,
  border: "none",
  padding: "8px 12px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  background: "#fdf0ff",
};

const navButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#f5f5f5",
  fontSize: 12,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  borderRadius: 999,
  border: "1px solid #333",
  padding: "8px 12px",
  fontSize: 13,
  background: "#111",
  color: "#f5f5f5",
};

export default App;
