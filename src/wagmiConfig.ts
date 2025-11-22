import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { hoodiChain } from './chains/hoodi';

export const wagmiConfig = getDefaultConfig({
  appName: 'Amipay',
  projectId: '69127a8488df390fbe5a1a7daf31e00f',
  chains: [hoodiChain],
  transports: {
    [hoodiChain.id]: http(hoodiChain.rpcUrls.default.http[0]),
  },
  ssr: false,
});
