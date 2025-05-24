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

// Create wallet connectors
const { wallets } = getDefaultWallets({
  appName: 'AstralPackLegends',
  projectId: '2838d376974238512f245e6198aa9b43',
  chains: [liskSepolia]
});

// Create connectors array from wallets
const connectors = connectorsForWallets(wallets, {
  projectId: '2838d376974238512f245e6198aa9b43',
  appName: 'AstralPackLegends',
});

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
          chains={[liskSepolia]}
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
