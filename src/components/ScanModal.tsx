import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

interface ScanModalProps {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
}

export function ScanModal({ open, onClose, onResult }: ScanModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#111",
          borderRadius: 24,
          padding: 16,
          color: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            alignItems: "center",
          }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Scan to pay</h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}>
            Close
          </button>
        </div>

        <div style={{ borderRadius: 16, overflow: "hidden" }}>
          <Scanner
            constraints={{ facingMode: "environment" }}
            onScan={(detectedCodes) => {
              if (!detectedCodes || detectedCodes.length === 0) return;
              const first = detectedCodes[0];
              console.log(first);
              const value = first.rawValue;
              console.log(value);
              onResult(value);
              onClose();
            }}
            onError={(e: any) => setError(e?.message ?? "Unknown error")}
          />
        </div>

        {error && (
          <p style={{ marginTop: 8, fontSize: 12, color: "#f87171" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
