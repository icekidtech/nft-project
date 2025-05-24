import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { 
  getContract, 
  fetchNFTMetadata, 
  getImageUrl,
  formatAddress,
  CONTRACT_ADDRESS
} from '../utils/contract';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { 
  Loader, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';

// Status enum
const MINT_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

type MintStatusType = typeof MINT_STATUS[keyof typeof MINT_STATUS];

const Mint = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  
  const [remainingNFTs, setRemainingNFTs] = useState<number>(0);
  const [mintStatus, setMintStatus] = useState<MintStatusType>(MINT_STATUS.IDLE);
  const [txHash, setTxHash] = useState<string>('');
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [mintedMetadata, setMintedMetadata] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };
  
  // Fetch contract data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const contract = getContract(publicClient as unknown as ethers.Provider);
        const unmintedTokens = await contract.getUnmintedTokens();
        setRemainingNFTs(unmintedTokens.length);
      } catch (error) {
        console.error("Error fetching contract data:", error);
        setErrorMessage("Couldn't load contract data. Please try again later.");
      }
    };

    fetchData();
    
    // Refresh every 10 seconds if idle
    const interval = setInterval(() => {
      if (mintStatus === MINT_STATUS.IDLE) {
        fetchData();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [publicClient, mintStatus]);
  
  // Fetch metadata for minted token
  useEffect(() => {
    const fetchMintedMetadata = async () => {
      if (mintedTokenId) {
        try {
          const metadata = await fetchNFTMetadata(mintedTokenId);
          setMintedMetadata(metadata);
        } catch (error) {
          console.error("Error fetching minted token metadata:", error);
        }
      }
    };
    
    fetchMintedMetadata();
  }, [mintedTokenId]);
  
  const handleMint = async () => {
    if (!walletClient) {
      setErrorMessage("Please connect your wallet first");
      return;
    }
    
    setMintStatus(MINT_STATUS.LOADING);
    setErrorMessage('');
    
    try {
      // Create a signer from walletClient
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      
      // Check if there are tokens left
      const unmintedTokens = await contract.getUnmintedTokens();
      if (unmintedTokens.length === 0) {
        throw new Error("All tokens have been minted!");
      }
      
      // Execute the mint transaction
      const tx = await contract.mintRandomNFT();
      setTxHash(tx.hash);
      
      // Wait for transaction to be mined
      console.log("Waiting for transaction to be mined...");
      const receipt = await tx.wait();
      
      // Extract the token ID from the NFTMinted event
      if (receipt && receipt.logs) {
        const event = receipt.logs.find(
          (log: any) => 'fragment' in log && log.fragment && log.fragment.name === 'NFTMinted'
        );
        
        if (event && 'args' in event) {
          setMintedTokenId(Number(event.args[1]));
          setMintStatus(MINT_STATUS.SUCCESS);
        } else {
          throw new Error("Couldn't find the minted token ID");
        }
      } else {
        throw new Error("Transaction was processed but couldn't extract token ID");
      }
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      setMintStatus(MINT_STATUS.ERROR);
      
      // Provide a user-friendly error message
      if (error.message && error.message.includes("user rejected transaction")) {
        setErrorMessage("Transaction was rejected in your wallet");
      } else if (error.message && error.message.includes("insufficient funds")) {
        setErrorMessage("Insufficient funds for gas * price + value");
      } else {
        setErrorMessage(error.message || "An unknown error occurred");
      }
    }
  };
  
  const equalsMintStatus = (a: MintStatusType, b: MintStatusType) => a === b;
  
  // Render different content based on mint status
  const renderContent = () => {
    switch (mintStatus) {
      case MINT_STATUS.LOADING:
        return (
          <div className="text-center p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Loader size={48} className="text-astral-blue" />
            </motion.div>
            <p className="text-xl mb-4">Transaction in progress...</p>
            {txHash && (
              <a 
                href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-astral-blue hover:underline mt-2 inline-flex items-center"
              >
                <span>View on Explorer</span>
                <ExternalLink size={16} className="ml-1" />
              </a>
            )}
          </div>
        );
        
      case MINT_STATUS.SUCCESS:
        return (
          <div className="text-center p-8">
            <div className="mb-6 bg-astral-purple/20 border border-astral-purple rounded-lg p-6 inline-block">
              <div className="w-24 h-24 mx-auto mb-4 text-5xl bg-astral-gold/20 rounded-full flex items-center justify-center">
                <CheckCircle2 size={48} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 cosmic-header">
                Congratulations!
              </h3>
              <p className="text-lg">
                You minted token <span className="font-bold text-astral-gold">#{mintedTokenId}</span>
              </p>
            </div>
            
            {mintedMetadata && (
              <div className="mb-6">
                <div className="nft-card aspect-square max-w-xs mx-auto">
                  <div className="h-3/4 overflow-hidden">
                    <img 
                      src={getImageUrl(mintedMetadata.image)} 
                      alt={mintedMetadata.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/400x400/1a1e3a/cc00ff?text=Astral+NFT';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-astral-gold truncate">{mintedMetadata.name}</h3>
                    <p className="text-xs text-white/70 truncate">
                      {mintedMetadata.description && mintedMetadata.description.substring(0, 60)}...
                    </p>
                  </div>
                </div>
                <a 
                  href={`https://sepolia-blockscout.lisk.com/token/${CONTRACT_ADDRESS}/instance/${mintedTokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-astral-blue hover:underline mt-4 inline-flex items-center"
                >
                  <span>View on Explorer</span>
                  <ExternalLink size={16} className="ml-1" />
                </a>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <button 
                onClick={() => setMintStatus(MINT_STATUS.IDLE)} 
                className="btn-primary"
              >
                Mint Another
              </button>
              <Link to="/" className="btn-secondary inline-flex items-center justify-center">
                <ArrowLeft size={16} className="mr-1" />
                Back to Home
              </Link>
            </div>
          </div>
        );
        
      case MINT_STATUS.ERROR:
        return (
          <div className="text-center p-8">
            <div className="mb-6">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-bold mb-2 text-red-400">
                Minting Failed
              </h3>
              <p className="text-white/80 mb-6">
                {errorMessage || "Something went wrong. Please try again."}
              </p>
              <button 
                onClick={() => setMintStatus(MINT_STATUS.IDLE)} 
                className="btn-primary inline-flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </button>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 cosmic-header">
                Ready to Mint?
              </h3>
              <p className="text-white/80 mb-4">
                Clicking the button below will initiate a transaction to mint a random Astral Pack Legend NFT.
              </p>
              <div className="bg-space-mid/40 backdrop-blur-sm p-4 rounded-xl border border-astral-blue/30 inline-block mb-6">
                <p className="text-lg">
                  Remaining NFTs: <span className="text-astral-gold font-bold">{remainingNFTs}</span> out of 104
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleMint} 
              className="btn-primary text-xl py-4 px-10 text-glow"
              disabled={equalsMintStatus(mintStatus, MINT_STATUS.LOADING) || remainingNFTs === 0}
            >
              {remainingNFTs > 0 ? "Mint Random NFT" : "All NFTs Minted"}
            </button>
            
            {errorMessage && (
              <p className="text-red-400 mt-4">{errorMessage}</p>
            )}
          </div>
        );
    }
  };
  
  return (
    <motion.div 
      className="max-w-3xl mx-auto"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ type: "tween", duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-glow cosmic-header">
          Mint Your Astral Pack Legend
        </h1>
        {address && (
          <p className="text-astral-blue mb-2">
            Connected: {formatAddress(address)}
          </p>
        )}
      </div>
      
      <div className="card">
        {renderContent()}
      </div>
    </motion.div>
  );
};

export default Mint;