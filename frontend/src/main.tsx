import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets
} from '@rainbow-me/rainbowkit';
import { http, createConfig, WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';
import { injectedWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';

// Configure Lisk Sepolia testnet as a custom chain
const liskSepolia = {
  id: 4202,
  name: 'Lisk Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia LSK',
    symbol: 'LSK',
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia-api.lisk.com'] },
  },
  blockExplorers: {
    default: { name: 'Lisk Explorer', url: 'https://sepolia-blockscout.lisk.com' },
  },
  testnet: true,
} as const;

// Project ID from WalletConnect
const projectId = '2838d376974238512f245e6198aa9b43';

// Create wallet connectors - corrected implementation for rainbowkit
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet({ chains: [liskSepolia], projectId }),
      metaMaskWallet({ chains: [liskSepolia], projectId })
    ],
  },
]);

// Create wagmi config
const wagmiConfig = createConfig({
  chains: [liskSepolia],
  connectors,
  transports: {
    [liskSepolia.id]: http(),
  },
});

// Create a client for React Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#cc00ff',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
          appInfo={{
            appName: 'AstralPackLegends',
          }}
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>
);
