import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Loader, AlertCircle, Award, RefreshCw } from 'lucide-react';
import { ipfsToHttp, fetchMetadataWithFallback } from '../utils/ipfs';

// Define interfaces
interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: NFTAttribute[];
}

interface NFTCardProps {
  tokenId: number;
  tokenUri?: string;
  isLoading?: boolean;
  owner?: string;
  contractAddress?: string;
  onRetry?: () => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ 
  tokenId, 
  tokenUri, 
  isLoading = false, 
  owner,
  contractAddress,
  onRetry 
}) => {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Function to load metadata
  const loadMetadata = async () => {
    if (!tokenUri) {
      // If no tokenUri provided, attempt to get from backend or construct default
      try {
        // Try to fetch from our API first
        const response = await fetch(`/api/token/${tokenId}`).catch(() => null);
        
        if (response && response.ok) {
          const data = await response.json();
          setMetadata(data);
          return;
        }
        
        // Fallback to direct Pinata gateway
        const metadataCid = import.meta.env.VITE_METADATA_CID || 'bafybeibakn3p7jleefqdzxe2fpjzlglbb7fkdo3bwl3uobq6de4ekuptxi';
        const fallbackUri = `https://gateway.pinata.cloud/ipfs/${metadataCid}/${tokenId}.json`;
        
        // Continue to fetching with our utility
        await fetchAndSetMetadata(fallbackUri);
      } catch (err) {
        console.error(`Could not fetch token info for #${tokenId}`, err);
        setError(`Failed to load token #${tokenId}`);
      }
    } else {
      await fetchAndSetMetadata(tokenUri);
    }
  };
  
  // Helper function to fetch and set metadata
  const fetchAndSetMetadata = async (uri: string) => {
    try {
      setIsLoadingMetadata(true);
      setError(null);
      
      const data = await fetchMetadataWithFallback(uri);
      setMetadata(data);
    } catch (error: any) {
      console.error(`Error loading metadata for token ${tokenId}:`, error);
      setError(`Failed to load metadata: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Load metadata when component mounts or tokenUri/retryCount changes
  useEffect(() => {
    if (!isLoading) {
      loadMetadata();
    }
  }, [tokenUri, isLoading, tokenId, retryCount]);

  // Generate image URL from metadata
  const imageUrl = metadata?.image ? ipfsToHttp(metadata.image) : '';

  // Function to handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (onRetry) onRetry();
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Render component
  return (
    <motion.div 
      className="nft-card"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.03, 
        boxShadow: '0 10px 25px -5px rgba(204, 0, 255, 0.3), 0 8px 10px -6px rgba(0, 204, 255, 0.2)' 
      }}
    >
      {isLoading || isLoadingMetadata ? (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          >
            <Loader size={32} className="text-astral-blue mb-3" />
          </motion.div>
          <p className="text-white/70">Loading NFT #{tokenId}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <AlertCircle size={32} className="text-red-400 mb-3" />
          <p className="text-white/70 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="flex items-center gap-2 bg-space-light/30 hover:bg-space-light/40 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <>
          <div className="relative h-3/5 overflow-hidden bg-space-dark/50">
            {imageUrl ? (
              <motion.img 
                src={imageUrl} 
                alt={metadata?.name || `Token #${tokenId}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/400x400/1a1e3a/cc00ff?text=Astral+NFT';
                  target.onerror = null; // Prevent infinite error loop
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-space-mid">
                <Image size={48} className="text-astral-blue/50" />
              </div>
            )}
            <div className="absolute top-2 right-2 bg-space-dark/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs flex items-center">
              <Award size={14} className="text-astral-gold mr-1" />
              <span className="text-astral-gold">#{tokenId}</span>
            </div>
          </div>
          
          <div className="p-4 h-2/5 flex flex-col">
            <h3 className="font-bold text-lg truncate cosmic-header">
              {metadata?.name || `Astral Legend #${tokenId}`}
            </h3>
            
            <p className="text-xs text-white/70 mb-2 line-clamp-2 flex-grow">
              {metadata?.description || "An extraordinary cosmic entity from the astral realm."}
            </p>
            
            {metadata?.attributes && metadata.attributes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto mb-2">
                {metadata.attributes.slice(0, 3).map((attr, idx) => (
                  <span key={idx} className="text-[10px] bg-space-light/50 px-2 py-1 rounded-full">
                    {attr.trait_type}: <span className="text-astral-blue">{attr.value}</span>
                  </span>
                ))}
                {metadata.attributes.length > 3 && (
                  <span className="text-[10px] bg-space-light/50 px-2 py-1 rounded-full">
                    +{metadata.attributes.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            {owner && (
              <div className="mt-auto text-xs text-white/50 flex items-center">
                <span className="truncate">Owner: {owner.substring(0, 6)}...{owner.substring(owner.length - 4)}</span>
              </div>
            )}
            
            {contractAddress && (
              <div className="mt-1 text-xs">
                <a 
                  href={`https://sepolia-blockscout.lisk.com/token/${contractAddress}/instance/${tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-astral-blue hover:underline flex items-center gap-1 w-fit"
                >
                  <span>View</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default NFTCard;