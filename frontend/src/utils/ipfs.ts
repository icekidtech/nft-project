/**
 * IPFS utilities for fetching and displaying NFT content
 */

// Gateway URLs to try in order of preference
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
export const ipfsToHttp = (ipfsUri: string): string => {
  if (!ipfsUri) return '';
  
  // If already an HTTP URL, return as is
  if (ipfsUri.startsWith('http')) return ipfsUri;
  
  let cid: string;
  
  // Handle ipfs:// protocol
  if (ipfsUri.startsWith('ipfs://')) {
    cid = ipfsUri.replace('ipfs://', '');
    return `${IPFS_GATEWAYS[0]}/ipfs/${cid}`;
  } 
  // Handle just the CID
  else if (ipfsUri.startsWith('Qm') || ipfsUri.startsWith('bafy')) {
    cid = ipfsUri;
    return `${IPFS_GATEWAYS[0]}/ipfs/${cid}`;
  }
  
  // If we can't parse it, return empty to avoid broken images
  console.warn('Invalid IPFS URI format:', ipfsUri);
  return '';
};

/**
 * Try fetching from different gateways until success
 * @param url - The URL to fetch
 * @returns Response from successful fetch
 */
const fetchWithGatewayFallback = async (url: string): Promise<Response> => {
  // Extract CID and path if it's an IPFS URL
  let cid: string | null = null;
  let path: string = '';
  
  if (url.includes('/ipfs/')) {
    const parts = url.split('/ipfs/');
    if (parts.length > 1) {
      const remainingParts = parts[1].split('/');
      cid = remainingParts[0];
      path = '/' + remainingParts.slice(1).join('/');
    }
  } else if (url.startsWith('ipfs://')) {
    const parts = url.replace('ipfs://', '').split('/');
    cid = parts[0];
    path = '/' + parts.slice(1).join('/');
  }

  // If we have a CID, try all gateways
  if (cid) {
    // Try each gateway
    for (const gateway of IPFS_GATEWAYS) {
      try {
        const gatewayUrl = `${gateway}/ipfs/${cid}${path}`;
        console.log(`Trying gateway: ${gatewayUrl}`);
        
        const response = await fetch(gatewayUrl, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          mode: 'cors'
        });
        
        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.warn(`Gateway ${gateway} failed:`, error);
      }
    }
  }
  
  // If not IPFS or all gateways failed, try original URL
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    },
    mode: 'cors'
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} from ${url}`);
  }
  
  return response;
};

/**
 * Fetch metadata with fallback to multiple gateways
 * @param uri - IPFS URI or HTTP URL
 * @returns Metadata object
 */
export const fetchMetadataWithFallback = async (uri: string): Promise<any> => {
  if (!uri) return null;
  
  try {
    const url = uri.startsWith('ipfs://') ? ipfsToHttp(uri) : uri;
    const response = await fetchWithGatewayFallback(url);
    
    // First check that we actually got JSON
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
    
    // Otherwise parse normally
    return await response.json();
  } catch (error) {
    console.error(`Error fetching metadata for ${uri}:`, error);
    throw error;
  }
};

/**
 * Create a proxy URL for IPFS content
 * @param url - Original URL
 * @returns Proxied URL to avoid CORS issues
 */
export const createProxyUrl = (url: string): string => {
  if (url.includes('gateway.pinata.cloud')) {
    return url.replace('https://gateway.pinata.cloud', '/pinata');
  }
  
  if (url.includes('ipfs.io')) {
    return url.replace('https://ipfs.io', '/ipfs');
  }
  
  return url;
};