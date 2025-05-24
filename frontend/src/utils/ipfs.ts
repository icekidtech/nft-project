/**
 * Utility functions for handling IPFS content
 */

// IPFS gateway service with fallbacks for reliable content loading

// Gateway URLs to try in order
const IPFS_GATEWAYS = [
  "https://cloudflare-ipfs.com",
  "https://ipfs.io", 
  "https://gateway.pinata.cloud",
  "https://dweb.link"
];

/**
 * Convert an IPFS URI to an HTTP URL
 * @param ipfsUri - The IPFS URI (ipfs://... or just the CID)
 * @returns HTTP URL to the IPFS content
 */
export const ipfsToHttp = (ipfsUri: string, gatewayIndex: number = 0): string => {
  if (!ipfsUri) return '';
  
  // If already an HTTP URL, return as is
  if (ipfsUri.startsWith('http')) return ipfsUri;
  
  const gateway = IPFS_GATEWAYS[gatewayIndex % IPFS_GATEWAYS.length];
  let cid: string;
  
  // Handle ipfs:// protocol
  if (ipfsUri.startsWith('ipfs://')) {
    cid = ipfsUri.replace('ipfs://', '');
    return `${gateway}/ipfs/${cid}`;
  } 
  // Handle just the CID
  else if (ipfsUri.startsWith('Qm') || ipfsUri.startsWith('bafy')) {
    cid = ipfsUri;
    return `${gateway}/ipfs/${cid}`;
  }
  
  // If we can't parse it, return empty to avoid broken images
  console.warn('Invalid IPFS URI format:', ipfsUri);
  return '';
};

/**
 * Fetch metadata with fallback to multiple gateways
 * @param uri - IPFS URI or HTTP URL
 * @returns Metadata object
 */
export const fetchMetadataWithFallback = async (uri: string): Promise<any> => {
  if (!uri) return null;
  
  // Try each gateway
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    try {
      // Convert to HTTP URL using the current gateway
      const url = uri.startsWith('ipfs://') || uri.startsWith('Qm') || uri.startsWith('bafy')
        ? ipfsToHttp(uri, i) 
        : uri;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`Failed to fetch from gateway ${IPFS_GATEWAYS[i]}:`, error);
      // Continue to next gateway if not on the last one
      if (i < IPFS_GATEWAYS.length - 1) continue;
      throw error;
    }
  }
  
  throw new Error('Failed to fetch metadata from all gateways');
};