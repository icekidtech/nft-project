import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AstralPackLegends", (m) => {
  // Use the metadata CID from your script
  const metadataCID = "bafybeibakn3p7jleefqdzxe2fpjzlglbb7fkdo3bwl3uobq6de4ekuptxi"; 
  const baseURI = `ipfs://${metadataCID}/`;
  
  // Deploy your contract with the baseURI constructor argument
  const contract = m.contract("AstralPackLegends", [baseURI]);
  
  // Return the futures
  return {
    contract
  };
});