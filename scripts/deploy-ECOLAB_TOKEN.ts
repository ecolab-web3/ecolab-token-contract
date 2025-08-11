async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Define the arguments for the initializer function
    const tokenName = "E-co.lab Fuji Test Token";
    const tokenSymbol = "ECO_FUJI";
    const tokenUri = "https://ecolab.foundation/api/testnet/metadata/{id}.json";
    const initialOwner = deployer.address;

    const EcolabToken = await ethers.getContractFactory("EcolabToken");
  
    console.log("Deploying EcolabToken as an upgradeable proxy...");
  
    const ecolabTokenProxy = await upgrades.deployProxy(
      EcolabToken,
      // Pass the arguments in the correct order
      [initialOwner, tokenName, tokenSymbol, tokenUri], 
      { 
        initializer: 'initialize', 
        kind: 'uups'
      }
    );

    await ecolabTokenProxy.waitForDeployment();
  
    const proxyAddress = await ecolabTokenProxy.getAddress();
    console.log("EcolabToken (Proxy) deployed to:", proxyAddress);
    console.log(`Token Name: ${tokenName}, Symbol: ${tokenSymbol}`);
}