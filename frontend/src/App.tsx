import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Home from './pages/Home';
import Mint from './pages/Mint';

// Footer component
const Footer = () => (
  <footer className="mt-auto py-6 text-center text-white/50 text-sm">
    <p>© {new Date().getFullYear()} AstralPackLegends. All rights reserved.</p>
  </footer>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isConnected } = useAccount();
  
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-astral-blue to-astral-purple flex items-center justify-center">
            <span className="text-white font-bold">APL</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold cosmic-header">
            AstralPackLegends
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {isConnected && (
            <span className="hidden md:inline-block text-astral-gold text-sm">
              {address && `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
            </span>
          )}
          <ConnectButton showBalance={false} />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/mint" 
            element={
              <ProtectedRoute>
                <Mint />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
