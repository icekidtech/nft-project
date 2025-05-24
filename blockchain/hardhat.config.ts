import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const WALLET_KEY = process.env.WALLET_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.23",
  networks: {
    liskSepolia: {
      url: "https://rpc.sepolia-api.lisk.com",
      accounts: [WALLET_KEY],
      chainId: 4202, // Verify this chainId for Lisk Sepolia
    },
  },
  etherscan: {
    apiKey: {
      liskSepolia: process.env.BLOCKSCOUT_API_KEY || "" // Optional for verification
    },
    customChains: [
      {
        network: "liskSepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com"
        }
      }
    ]
  }
};

export default config;
