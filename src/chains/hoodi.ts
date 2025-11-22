import type { Chain } from '@rainbow-me/rainbowkit';

export const hoodiChain = {
  id: 560048,
  name: 'Hoodi',
  iconUrl: undefined,
  iconBackground: '#000000',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://0xrpc.io/hoodi'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HoodiScan',
      url: 'https://hoodi.etherscan.io',
    },
  },
  testnet: true,
} as const satisfies Chain;
