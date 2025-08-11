import { ethers, upgrades } from "hardhat";

async function main() {
  // Get the signer (wallet) that will be deploying the contract
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the ContractFactory for our EcolabToken
  const EcolabToken = await ethers.getContractFactory("EcolabToken");
  
  console.log("Deploying EcolabToken as an upgradeable proxy...");
  
  // This is the core function. It deploys our implementation contract,
  // deploys the proxy contract, and links them together.
  // It also calls the 'initialize' function with the provided arguments.
  const ecolabTokenProxy = await upgrades.deployProxy(
    EcolabToken,
    [deployer.address], // Arguments for the `initialize` function: [initialOwner]
    { 
      initializer: 'initialize', 
      kind: 'uups' // Specifies the UUPS proxy pattern, which is more gas-efficient for upgrades.
    }
  );

  // Wait until the deployment transaction is mined
  await ecolabTokenProxy.waitForDeployment();
  
  // Get the address of the PROXY contract, which is the one we will interact with
  const proxyAddress = await ecolabTokenProxy.getAddress();
  console.log("EcolabToken (Proxy) deployed to:", proxyAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});