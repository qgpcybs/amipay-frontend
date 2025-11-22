import type { Abi } from "viem";

export const USDC_ADDRESS = "0xCad6980d7c09EEcd20D4c12110C8b89755D9A227";
export const AMIPAY_ADDRESS = "0x7b07761ae6D912B33Af13dFc962162ff8F611EaC";

// mock USDC ABI
export const erc20Abi = [
  {
    type: "function",
    stateMutability: "view",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "symbol",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const satisfies Abi;

// Amipay ABI
export const amiPayAbi = [
  {
    type: "function",
    name: "depositAllowance",
    stateMutability: "nonpayable",
    inputs: [
      { name: "beneficiary", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "spendFrom",
    stateMutability: "nonpayable",
    inputs: [
      { name: "sponsor", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    // public mapping allowances[beneficiary][sponsor]
    type: "function",
    name: "allowances",
    stateMutability: "view",
    inputs: [
      { name: "beneficiary", type: "address" },
      { name: "sponsor", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const satisfies Abi;
