import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { getContract, CONTRACT_ADDRESS } from '../utils/contract';
import { motion } from 'framer-motion';
import { Rocket, Star, Info } from 'lucide-react';
import NFTCard from '../components/NFTCard';

const Home = () => {
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();
  
  const [remainingNFTs, setRemainingNFTs] = useState<number>(104);
  const [totalSupply] = useState<number>(104);
  const [randomTokenIds, setRandomTokenIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractData = async () => {
      setIsLoading(true);
      setLoadingError(null);
      
      try {
        // Use publicClient to get the contract data
        const contract = getContract(publicClient as unknown as ethers.Provider);
        
        // Get unminted tokens
        const unmintedTokens = await contract.getUnmintedTokens();
        setRemainingNFTs(unmintedTokens.length);
        
        // Get minted and unminted tokens
        const allTokenIds = Array.from({ length: 104 }, (_, i) => i + 1); // 1 to 104
        const mintedTokenIds = allTokenIds.filter(id => 
          !unmintedTokens.includes(BigInt(id))
        );
        
        // Get 5 random NFTs (either from minted ones or placeholder numbers)
        const availableTokens = mintedTokenIds.length > 0 
          ? mintedTokenIds 
          : allTokenIds;
        
        // Shuffle and take 5
        const shuffled = [...availableTokens].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        
        setRandomTokenIds(selected);
      } catch (error: any) {
        console.error("Error fetching contract data:", error);
        setLoadingError(error.message || "Failed to load contract data");
        // Set default values for demo purposes
        setRandomTokenIds([5, 10, 30, 82, 92]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractData();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchContractData, 10000);
    return () => clearInterval(interval);
  }, [publicClient]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleRetry = () => {
    setLoadingError(null);
    // Will trigger effect to reload
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="text-center mb-12" variants={itemVariants}>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-glow cosmic-header">
          Welcome to AstralPackLegends
        </h1>
        <p className="text-xl text-white/80 mb-6">
          Mint Your Cosmic NFT and own a piece of the cosmos
        </p>
        
        <motion.div 
          className="bg-space-mid/40 backdrop-blur-sm p-4 rounded-xl border border-astral-blue/30 inline-block mb-8"
          whileHover={{ scale: 1.05 }}
          variants={itemVariants}
        >
          <p className="text-lg">
            Remaining NFTs: <span className="text-astral-gold font-bold">{remainingNFTs}</span> out of {totalSupply}
          </p>
        </motion.div>
        
        {!isConnected ? (
          <motion.div 
            className="mb-10 flex flex-col items-center space-y-4"
            variants={itemVariants}
          >
            <p className="text-white/80">Connect your wallet to start minting cosmic NFTs</p>
            <ConnectButton label="Connect Your Cosmic Wallet" />
          </motion.div>
        ) : (
          <motion.div 
            className="mb-10"
            variants={itemVariants}
          >
            <Link to="/mint" className="btn-primary inline-flex items-center text-glow">
              <span>Go to Minting</span>
              <Rocket className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        )}
      </motion.div>
      
      {loadingError ? (
        <motion.div className="card text-center py-10" variants={itemVariants}>
          <div className="text-red-400 mb-4">
            <AlertCircle size={40} className="mx-auto mb-2" />
            <p>{loadingError}</p>
          </div>
          <button 
            onClick={handleRetry}
            className="btn-primary mt-4 inline-flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> 
            Retry Loading
          </button>
        </motion.div>
      ) : (
        <motion.div className="mb-12" variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-6 text-center cosmic-header flex items-center justify-center">
            <Star className="mr-2 text-astral-gold" />
            Featured Astral Legends
            <Star className="ml-2 text-astral-gold" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {randomTokenIds.map((tokenId, index) => (
              <motion.div 
                key={tokenId}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <NFTCard 
                  tokenId={tokenId} 
                  isLoading={isLoading} 
                  contractAddress={CONTRACT_ADDRESS}
                  onRetry={handleRetry}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className="card text-center my-12"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold mb-4 cosmic-header flex items-center justify-center">
          <Info className="mr-2 text-astral-purple" />
          About AstralPackLegends
        </h2>
        <p className="text-white/80">
          A unique collection of 104 cosmic entities forged in the celestial planes.
          Each Astral Pack Legend has its own unique story and properties,
          making it a truly one-of-a-kind digital collectible on the Lisk blockchain.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Home;