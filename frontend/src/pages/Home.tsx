import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { 
  getContract, 
  fetchNFTMetadata, 
  getImageUrl,
  type NFTMetadata 
} from '../utils/contract';

// NFT Card Component
const NFTCard = ({ 
  tokenId, 
  isLoading = false 
}: { 
  tokenId: number, 
  isLoading?: boolean 
}) => {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  useEffect(() => {
    const loadMetadata = async () => {
      if (isLoading) return;
      
      setIsLoadingMetadata(true);
      try {
        const data = await fetchNFTMetadata(tokenId);
        setMetadata(data);
      } catch (error) {
        console.error(`Error loading metadata for token ${tokenId}:`, error);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, [tokenId, isLoading]);

  if (isLoading || isLoadingMetadata) {
    return (
      <div className="nft-card aspect-square animate-pulse">
        <div className="h-3/4 bg-space-light/50"></div>
        <div className="p-4 space-y-2">
          <div className="h-4 bg-space-light/50 rounded w-3/4"></div>
          <div className="h-3 bg-space-light/50 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="nft-card aspect-square">
        <div className="h-full flex items-center justify-center">
          <p className="text-astral-blue">Error loading NFT</p>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(metadata.image);

  return (
    <div className="nft-card aspect-square">
      <div className="h-3/4 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={metadata.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1a1e3a/cc00ff?text=Astral+NFT';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-astral-gold truncate">{metadata.name}</h3>
        <p className="text-xs text-white/70 truncate">{metadata.description.substring(0, 60)}...</p>
      </div>
    </div>
  );
};

const Home = () => {
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();
  const [remainingNFTs, setRemainingNFTs] = useState<number>(0);
  const [totalSupply] = useState<number>(104);
  const [randomTokenIds, setRandomTokenIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContractData = async () => {
      setIsLoading(true);
      try {
        // Use publicClient here (previously provider)
        const contract = getContract(publicClient as unknown as ethers.Provider);
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
      } catch (error) {
        console.error("Error fetching contract data:", error);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-glow cosmic-header">
          Welcome to AstralPackLegends
        </h1>
        <p className="text-xl text-white/80 mb-6">
          Mint Your Cosmic NFT and own a piece of the cosmos
        </p>
        
        <div className="bg-space-mid/40 backdrop-blur-sm p-4 rounded-xl border border-astral-blue/30 inline-block mb-8">
          <p className="text-lg">
            Remaining NFTs: <span className="text-astral-gold font-bold">{remainingNFTs}</span> out of {totalSupply}
          </p>
        </div>
        
        {!isConnected ? (
          <div className="mb-10 flex flex-col items-center space-y-4">
            <p className="text-white/80">Connect your wallet to start minting cosmic NFTs</p>
            <ConnectButton label="Connect Your Cosmic Wallet" />
          </div>
        ) : (
          <div className="mb-10">
            <Link to="/mint" className="btn-primary inline-block text-glow">
              Go to Minting 🚀
            </Link>
          </div>
        )}
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center cosmic-header">
          Featured Astral Legends
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {randomTokenIds.map((tokenId) => (
            <NFTCard key={tokenId} tokenId={tokenId} isLoading={isLoading} />
          ))}
        </div>
      </div>
      
      <div className="card text-center my-12">
        <h2 className="text-2xl font-bold mb-4 cosmic-header">About AstralPackLegends</h2>
        <p className="text-white/80">
          A unique collection of 104 cosmic entities forged in the celestial planes.
          Each Astral Pack Legend has its own unique story and properties,
          making it a truly one-of-a-kind digital collectible on the Lisk blockchain.
        </p>
      </div>
    </div>
  );
};

export default Home;