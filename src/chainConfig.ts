import type { Abi } from "viem";

export const USDC_ADDRESS = "0xF6dEa88014c66558c2cE486390DB3C2892472054";
export const AMIPAY_ADDRESS = "0x07a338D211D559c35B51d13fabF4CC83880e998C";

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
