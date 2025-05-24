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
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Function to get contract using ethers
export const getContract = (provider: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// Function to fetch NFT metadata from Pinata
export const fetchNFTMetadata = async (tokenId: number): Promise<NFTMetadata> => {
  try {
    const response = await fetch(`${PINATA_GATEWAY}${tokenId}.json`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata for token ${tokenId}: ${response.status}`);
    }
    
    // Check if we got JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Try to read as text and parse
      const text = await response.text();
      
      // Check if we got HTML instead of JSON
      if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
        console.error('Received HTML instead of JSON:', text.substring(0, 100));
        throw new Error('Received HTML instead of JSON');
      }
      
      // Try to parse as JSON
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response as JSON:', text.substring(0, 100));
        throw new Error('Invalid JSON response');
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching metadata for token ${tokenId}:`, error);
    // Return default metadata
    return {
      name: `Astral Pack Legend #${tokenId}`,
      description: "Metadata temporarily unavailable. Please try again later.",
      image: "",
      attributes: []
    };
  }
};

// Format address to short form
export const formatAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Get image URL from URI (handle ipfs:// protocol)
export const getImageUrl = (uri?: string): string => {
  if (!uri) return '';
  
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  
  return uri;
};