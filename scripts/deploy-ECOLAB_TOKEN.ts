import { ethers, upgrades } from "hardhat";

async function main() {
  // Get the signer (wallet) that will be deploying the contract.
  const [deployer] = await ethers.getSigners();
  console.log(
    `Deploying contracts with the account: ${deployer.address}`
  );

  // Define the arguments for the initializer function.
  // This is where we configure the token for the specific network.
  const tokenName = "E-co.lab Fuji Test Token";
  const tokenSymbol = "ECO_FUJI";
  const tokenUri = "https://ecolab.foundation/api/testnet/metadata/{id}.json";
  const initialOwner = deployer.address;

  // Get the ContractFactory for our EcolabToken.
  const EcolabToken = await ethers.getContractFactory("EcolabToken");
  
  console.log("Deploying EcolabToken as an upgradeable proxy...");
  
  // Deploy the proxy and initialize the implementation contract.
  const ecolabTokenProxy = await upgrades.deployProxy(
    EcolabToken,
    [initialOwner, tokenName, tokenSymbol, tokenUri], 
    { 
      initializer: 'initialize', 
      kind: 'uups'
    }
  );

  // Wait until the deployment transaction is confirmed on the network.
  await ecolabTokenProxy.waitForDeployment();
  
  const proxyAddress = await ecolabTokenProxy.getAddress();

  // Log the final, most important information.
  console.log(
    `\n🚀 EcolabToken (Proxy) successfully deployed!`
  );
  console.log(
    `   - Proxy Address: ${proxyAddress}`
  );
  console.log(
    `   - Token Name: ${tokenName}`
  );
  console.log(
    `   - Token Symbol: ${tokenSymbol}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});