import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Mint from './pages/Mint';
import { formatAddress } from './utils/contract';
import { Home as HomeIcon } from 'lucide-react';

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
  const location = useLocation();

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
        
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a 
              href="/"
              className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-space-light/20"
              aria-label="Home"
            >
              <HomeIcon size={20} />
            </a>
          </motion.div>
          
          {isConnected && address && (
            <span className="hidden md:inline-block text-astral-gold text-sm">
              {formatAddress(address)}
            </span>
          )}
          
          <ConnectButton showBalance={false} />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
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
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
