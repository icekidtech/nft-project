import { ethers } from "hardhat";
import { expect } from "chai";
import { AstralPackLegends } from "../typechain-types";

describe("AstralPackLegends", function () {
  let astralPackLegends: AstralPackLegends;
  let owner: any;
  let addr1: any;
  let addr2: any;

  const metadataCID = "bafybeibakn3p7jleefqdzxe2fpjzlglbb7fkdo3bwl3uobq6de4ekuptxi";
  const baseURI = `ipfs://${metadataCID}/`;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const AstralPackLegends = await ethers.getContractFactory("AstralPackLegends");
    astralPackLegends = await AstralPackLegends.deploy(baseURI);
    await astralPackLegends.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await astralPackLegends.owner()).to.equal(owner.address);
    });

    it("Should initialize with 104 unminted tokens", async function () {
      const unmintedTokens = await astralPackLegends.getUnmintedTokens();
      expect(unmintedTokens.length).to.equal(104);
      for (let i = 1; i <= 104; i++) {
        expect(unmintedTokens.includes(BigInt(i))).to.be.true;
      }
    });
  });

  describe("Minting", function () {
    it("Should mint a random token", async function () {
      await astralPackLegends.mintRandomNFT();
      const unmintedTokens = await astralPackLegends.getUnmintedTokens();
      expect(unmintedTokens.length).to.equal(103);
      expect(await astralPackLegends.balanceOf(owner.address)).to.equal(1);
    });

    it("Should emit NFTMinted event", async function () {
      const tx = await astralPackLegends.mintRandomNFT();
      const receipt = await tx.wait();
      
      // Get the NFTMinted event from the receipt
      const event = receipt?.logs.find(
        log => 'fragment' in log && log.fragment && log.fragment.name === 'NFTMinted'
      );
      
      // Check that the event was emitted
      expect(event).to.not.be.undefined;
      
      // TypeScript: Check if event is EventLog type with args property
      if (event && 'args' in event) {
        // Check that the first arg is the owner address
        expect(event.args[0]).to.equal(owner.address);
        
        // Check that the token ID is a valid number (any value between 1 and 104)
        const tokenId = event.args[1];
        expect(tokenId).to.be.greaterThanOrEqual(1);
        expect(tokenId).to.be.lessThanOrEqual(104);
      } else {
        expect.fail("Event didn't contain parsed arguments");
      }
    });
  });

  describe("Owner functions", function () {
    it("Should allow the owner to withdraw ETH", async function () {
      // Send ETH to the contract
      await owner.sendTransaction({ to: astralPackLegends.target, value: ethers.parseEther("1.0") });
      const initialBalance = await ethers.provider.getBalance(owner.address);

      // Withdraw ETH
      await expect(astralPackLegends.withdraw())
        .to.emit(astralPackLegends, "Withdrawn")
        .withArgs(owner.address, ethers.parseEther("1.0"));

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.above(initialBalance);
      expect(await ethers.provider.getBalance(astralPackLegends.target)).to.equal(0);
    });

    it("Should not allow non-owners to withdraw", async function () {
      // Send ETH to the contract
      await owner.sendTransaction({ to: astralPackLegends.target, value: ethers.parseEther("1.0") });

      // Attempt to withdraw with a non-owner should revert
      await expect(astralPackLegends.connect(addr1).withdraw())
        .to.be.revertedWithCustomError(astralPackLegends, "OwnableUnauthorizedAccount");
    });
  });

  describe("Additional Functionality", function () {
    it("Should track total supply correctly", async function () {
      expect(await astralPackLegends.totalSupply()).to.equal(0);
      await astralPackLegends.mintRandomNFT();
      expect(await astralPackLegends.totalSupply()).to.equal(1);
      await astralPackLegends.mintRandomNFT();
      expect(await astralPackLegends.totalSupply()).to.equal(2);
    });

    it("Should receive ETH via receive function", async function () {
      const initialBalance = await ethers.provider.getBalance(astralPackLegends.target);
      await owner.sendTransaction({ to: astralPackLegends.target, value: ethers.parseEther("0.5") });
      const finalBalance = await ethers.provider.getBalance(astralPackLegends.target);
      expect(finalBalance).to.equal(initialBalance + ethers.parseEther("0.5"));
    });
  });
});