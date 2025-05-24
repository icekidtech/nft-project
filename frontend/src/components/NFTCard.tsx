import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, ExternalLink, Loader, AlertCircle, Award } from 'lucide-react';
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
}

const NFTCard: React.FC<NFTCardProps> = ({ tokenId, tokenUri, isLoading = false, owner }) => {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to load metadata
  const loadMetadata = async () => {
    if (!tokenUri) {
      // If no tokenUri provided, attempt to get from backend API
      try {
        const response = await fetch(`/api/token/${tokenId}`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        setMetadata(data);
        return;
      } catch (err) {
        console.error(`Could not fetch token info for #${tokenId}`, err);
        setError(`Failed to load token #${tokenId}`);
        return;
      }
    }
    
    try {
      setIsLoadingMetadata(true);
      setError(null);
      
      // Use the fallback method instead of direct fetch
      const data = await fetchMetadataWithFallback(tokenUri);
      setMetadata(data);
    } catch (error) {
      console.error(`Error loading metadata for token ${tokenId}:`, error);
      setError(`Failed to load metadata for token ${tokenId}`);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Load metadata when component mounts or tokenUri changes
  useEffect(() => {
    if (!isLoading) {
      loadMetadata();
    }
  }, [tokenUri, isLoading, tokenId]);

  // Generate image URL from metadata
  const imageUrl = metadata?.image ? ipfsToHttp(metadata.image) : '';

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
          <p className="text-white/70">Failed to load NFT</p>
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
                  (e.currentTarget.src = 'https://placehold.co/400x400/1a1e3a/cc00ff?text=Astral+NFT');
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
          </div>
        </>
      )}
    </motion.div>
  );
};

export default NFTCard;