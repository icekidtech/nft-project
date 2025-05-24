import { ethers } from 'ethers';

// ABI for the AstralPackLegends contract
export const CONTRACT_ABI = [
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getUnmintedTokens() view returns (uint256[])",
  "function mintRandomNFT()",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event NFTMinted(address indexed user, uint256 tokenId)"
];

// Contract address (can be overridden by environment variable)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x1234567890abcdef1234567890abcdef12345678';

// Metadata info
export const METADATA_CID = import.meta.env.VITE_METADATA_CID || 'bafybeibakn3p7jleefqdzxe2fpjzlglbb7fkdo3bwl3uobq6de4ekuptxi';
export const BASE_URI = `ipfs://${METADATA_CID}/`;
export const PINATA_GATEWAY = `https://gateway.pinata.cloud/ipfs/${METADATA_CID}/`;

// Interface for NFT metadata
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

// Function to get contract using ethers
export const getContract = (provider: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// Function to fetch NFT metadata from Pinata
export const fetchNFTMetadata = async (tokenId: number): Promise<NFTMetadata> => {
  try {
    const response = await fetch(`${PINATA_GATEWAY}${tokenId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata for token ${tokenId}`);
    }
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error(`Error fetching metadata for token ${tokenId}:`, error);
    return {
      name: `Astral Pack Legend #${tokenId}`,
      description: "Metadata unavailable",
      image: "", // Fallback image could be added here
      attributes: [
        {
          trait_type: "Number",
          value: tokenId
        }
      ]
    };
  }
};

// Function to get IPFS image URL with Pinata gateway
export const getImageUrl = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  
  // Replace ipfs:// with the Pinata gateway URL
  if (ipfsUrl.startsWith('ipfs://')) {
    const cid = ipfsUrl.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  
  return ipfsUrl;
};

// Function to format addresses (0x1234...5678)
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};