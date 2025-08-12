import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { EcolabToken } from "../typechain-types";
import { EcolabTokenV2 } from "../typechain-types"; // Import the V2 contract type

// Describes the test suite for the EcolabToken contract
describe("EcolabToken", function () {
  
  // Declare variables at the top level of the describe block
  // so they are accessible to all tests (`it` blocks).
  let ecolabTokenProxy: EcolabToken;
  let owner: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;
  let rwaMinterAccount: HardhatEthersSigner;

  const ECO_TOKEN_ID = 0;
  const RWA_TOKEN_ID = 1;

  // This `beforeEach` hook runs before each `it` test, deploying a fresh contract instance.
  beforeEach(async function () {
    [owner, otherAccount, rwaMinterAccount] = await ethers.getSigners();

    const EcolabTokenFactory = await ethers.getContractFactory("EcolabToken");

    ecolabTokenProxy = await upgrades.deployProxy(EcolabTokenFactory, [
        owner.address,
        "Ecolab Test Token",
        "ECO_TEST",
        "https://ecolab.foundation/api/testnet/metadata/{id}.json"
    ], { initializer: 'initialize', kind: 'uups' }) as unknown as EcolabToken;

    await ecolabTokenProxy.waitForDeployment();
  });

  // Groups tests related to deployment and initial state
  describe("Deployment and Initialization", function () {
    it("Should set the right owner", async function () {
      expect(await ecolabTokenProxy.owner()).to.equal(owner.address);
    });

    it("Should set the right name and symbol", async function () {
      expect(await ecolabTokenProxy.name()).to.equal("Ecolab Test Token");
      expect(await ecolabTokenProxy.symbol()).to.equal("ECO_TEST");
    });
  });

  // Groups tests for administrative functions
  describe("Admin Functions (Ownable)", function () {
    describe("mint", function () {
      it("Should allow the owner to mint tokens", async function () {
        const mintAmount = 1000;
        await ecolabTokenProxy.connect(owner).mint(otherAccount.address, ECO_TOKEN_ID, mintAmount, "0x");
        expect(await ecolabTokenProxy.balanceOf(otherAccount.address, ECO_TOKEN_ID)).to.equal(mintAmount);
      });

      it("Should prevent non-owners from minting tokens", async function () {
        await expect(
            ecolabTokenProxy.connect(otherAccount).mint(otherAccount.address, ECO_TOKEN_ID, 1000, "0x")
        ).to.be.revertedWithCustomError(ecolabTokenProxy, "OwnableUnauthorizedAccount")
         .withArgs(otherAccount.address);
      });

      it("Should prevent re-initializing the V2 implementation", async function () {
        const EcolabTokenV2Factory = await ethers.getContractFactory("EcolabTokenV2");
        const upgradedProxy = await upgrades.upgradeProxy(await ecolabTokenProxy.getAddress(), EcolabTokenV2Factory) as unknown as EcolabTokenV2;
    
        // First call to initialize is successful
        await upgradedProxy.initializeV2();
        expect(await upgradedProxy.version()).to.equal("V2");

        // Second call should fail
        await expect(
            upgradedProxy.initializeV2()
        ).to.be.revertedWithCustomError(upgradedProxy, "InvalidInitialization");
      });
    });

    describe("burn", function () {
      it("Should allow the owner to burn tokens", async function () {
          const mintAmount = 1000;
          await ecolabTokenProxy.connect(owner).mint(owner.address, ECO_TOKEN_ID, mintAmount, "0x");
          await ecolabTokenProxy.connect(owner).burn(owner.address, ECO_TOKEN_ID, mintAmount);
          expect(await ecolabTokenProxy.balanceOf(owner.address, ECO_TOKEN_ID)).to.equal(0);
      });

      it("Should prevent non-owners from burning tokens", async function () {
          const mintAmount = 1000;
          await ecolabTokenProxy.connect(owner).mint(owner.address, ECO_TOKEN_ID, mintAmount, "0x");
          await expect(
              ecolabTokenProxy.connect(otherAccount).burn(owner.address, ECO_TOKEN_ID, mintAmount)
          ).to.be.revertedWithCustomError(ecolabTokenProxy, "OwnableUnauthorizedAccount")
           .withArgs(otherAccount.address);
      });
    });

    describe("setRwaMinter", function () {
      it("Should allow the owner to set the RWA minter", async function () {
        await ecolabTokenProxy.connect(owner).setRwaMinter(rwaMinterAccount.address);
        expect(await ecolabTokenProxy.rwaMinter()).to.equal(rwaMinterAccount.address);
      });

      it("Should prevent non-owners from setting the RWA minter", async function () {
        await expect(
          ecolabTokenProxy.connect(otherAccount).setRwaMinter(rwaMinterAccount.address)
        ).to.be.revertedWithCustomError(ecolabTokenProxy, "OwnableUnauthorizedAccount")
         .withArgs(otherAccount.address);
      });
    });
  });

  // Groups tests for the RWA minter logic
  describe("RWA Minter Logic", function () {
    beforeEach(async function () {
      await ecolabTokenProxy.connect(owner).setRwaMinter(rwaMinterAccount.address);
    });

    it("Should allow the authorized RWA minter to mint RWA tokens (ID > 0)", async function () {
      await ecolabTokenProxy.connect(rwaMinterAccount).mintRWA(otherAccount.address, RWA_TOKEN_ID, 1);
      expect(await ecolabTokenProxy.balanceOf(otherAccount.address, RWA_TOKEN_ID)).to.equal(1);
    });
    
    it("Should prevent the owner from calling mintRWA directly", async function () {
      await expect(
        ecolabTokenProxy.connect(owner).mintRWA(otherAccount.address, RWA_TOKEN_ID, 1)
      ).to.be.revertedWith("EcolabToken: Caller is not the RWA Minter");
    });

    it("Should prevent an unauthorized account from calling mintRWA", async function () {
      await expect(
        ecolabTokenProxy.connect(otherAccount).mintRWA(otherAccount.address, RWA_TOKEN_ID, 1)
      ).to.be.revertedWith("EcolabToken: Caller is not the RWA Minter");
    });
    
    it("Should prevent RWA minter from minting the main ECO token (ID 0)", async function () {
      await expect(
        ecolabTokenProxy.connect(rwaMinterAccount).mintRWA(otherAccount.address, ECO_TOKEN_ID, 1)
      ).to.be.revertedWith("EcolabToken: Cannot mint ECO token via this function");
    });
  });

  // Groups tests for the upgrade functionality
  describe("Upgrades", function () {
    it("Should allow the owner to upgrade the contract to a V2", async function () {
        const EcolabTokenV2Factory = await ethers.getContractFactory("EcolabTokenV2");
        const upgradedProxy = await upgrades.upgradeProxy(await ecolabTokenProxy.getAddress(), EcolabTokenV2Factory) as unknown as EcolabTokenV2;
        
        await upgradedProxy.initializeV2();
        
        expect(await upgradedProxy.version()).to.equal("V2");
        expect(await upgradedProxy.owner()).to.equal(owner.address);
        expect(await upgradedProxy.name()).to.equal("Ecolab Test Token");
    });

    it("Should prevent non-owners from upgrading the contract", async function () {
        const EcolabTokenV2Factory = await ethers.getContractFactory("EcolabTokenV2");
        
        await expect(
            upgrades.upgradeProxy(await ecolabTokenProxy.getAddress(), EcolabTokenV2Factory.connect(otherAccount))
        ).to.be.revertedWithCustomError(ecolabTokenProxy, "OwnableUnauthorizedAccount")
         .withArgs(otherAccount.address);
    });
  });

});