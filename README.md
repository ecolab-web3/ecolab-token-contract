# E-co.lab Token Contract

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Solidity Version](https://img.shields.io/badge/Solidity-^0.8.20-blue.svg)
![Framework](https://img.shields.io/badge/Framework-Hardhat-orange.svg)
![Standard](https://img.shields.io/badge/Standard-ERC1155-lightgrey.svg)

## About The Project

This repository contains the official Solidity smart contracts for the **E-co.lab Token ($ECO)**. This is the core token contract for the E-co.lab ecosystem, designed to manage both the primary fungible token ($ECO) and future Real-World Asset (RWA) tokens.

The contract is built following the ERC-1155 Multi-Token Standard and is designed to be upgradeable using the UUPS proxy pattern, ensuring long-term flexibility and security.

Built with **Hardhat** and **OpenZeppelin Contracts**.

### Key Features

*   **ERC-1155 Multi-Token Standard:** A single contract to manage both the fungible `$ECO` token (ID 0) and an infinite number of unique RWA NFTs (IDs > 0).
*   **Upgradeable (UUPS Proxies):** The contract logic can be updated to add new features or fix bugs without requiring a token migration.
*   **Ownable Access Control:** Administrative functions like minting new tokens are restricted to a secure owner address, which will eventually be controlled by the E-co.lab DAO.
*   **Flexible Initialization:** Supports different configurations for name, symbol, and metadata URI, allowing for distinct deployments on testnets and mainnet.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   **Node.js** (v20 LTS recommended)
*   **npm** (comes with Node.js)
*   **Git**

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/ecolab-web3/ecolab-token-contract.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd ecolab-token-contract
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```

## Usage

This project uses Hardhat as its development environment for compiling, testing, and deploying smart contracts.

*   **Compile the contracts:**
    ```sh
    npx hardhat compile
    ```
*   **Run tests (coming soon):**
    ```sh
    npx hardhat test
    ```
*   **Deploy to a network:**
    ```sh
    npx hardhat run scripts/deploy-ECOLAB_TOKEN.ts --network <networkName>
    ```

## Deployment

The V1.1.0 of the EcolabToken contract has been successfully deployed and verified on the Avalanche Fuji Testnet.

### Avalanche Fuji Testnet

*   **Status:** **Completed** ✅
*   **Current Active Proxy Address:**
    `0x2ab5510b2E954F95b1F9F50deA7d8CAF41C418AE`
*   **DEPRECATED (DO NOT USE):**
    `0x1beF1F515cb4E1EDa4AaDCCC7a4D3E9503889f97`
    *   *(Reason: Ownership has been permanently renounced due to an error in the initial deployment parameters.)*

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please feel free to fork the repo and create a pull request, or open an issue with the tag "enhancement".

## License

Distributed under the MIT License. See `LICENSE` for more information.