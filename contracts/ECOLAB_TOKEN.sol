// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title EcolabToken
 * @dev This is the V1 core contract for the E-co.lab ecosystem, designed to be upgradeable.
 * It follows the ERC-1155 standard to manage both the fungible $ECO token
 * and the non-fungible Real-World Asset (RWA) tokens.
 * Access control is managed by the Ownable pattern.
 * @custom:oz-upgrades-unsafe-allow constructor
 */
contract EcolabToken is Initializable, ERC1155Upgradeable, OwnableUpgradeable {

    // --- Constants ---

    uint256 public constant ECO_TOKEN = 0;
    string public constant NAME = "E-co.lab Token";
    string public constant SYMBOL = "ECO";

    // --- State Variables ---

    /**
     * @dev Address of the dedicated RWA minter contract.
     * This contract will have the sole permission to mint new RWA NFTs (token IDs > 0).
     */
    address public rwaMinter;

    // --- Initializer ---

    /**
     * @dev The constructor is left empty to be compatible with the upgradeable proxy pattern.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializer function, serves as the constructor for the proxy.
     * It sets the initial owner and the base metadata URI.
     * Can only be called once by the proxy deployment process.
     * @param initialOwner The address that will have administrative control over the contract.
     */
    function initialize(address initialOwner) public initializer {
        __ERC1155_init("https://ecolab.foundation/api/metadata/{id}.json");
        __Ownable_init(initialOwner);
    }

    // --- Admin Functions (Owner Only) ---

    /**
     * @dev Mints new tokens. Can be used for both $ECO and RWAs.
     * Restricted to the contract owner.
     * @param to The address to mint tokens to.
     * @param id The token ID to mint.
     * @param amount The amount of tokens to mint.
     * @param data Additional data with no specified format.
     */
    function mint(address to, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(to, id, amount, data);
    }

    /**
     * @dev Burns (destroys) existing tokens.
     * Restricted to the contract owner.
     * @param from The address to burn tokens from.
     * @param id The token ID to burn.
     * @param amount The amount of tokens to burn.
     */
    function burn(address from, uint256 id, uint256 amount) public onlyOwner {
        _burn(from, id, amount);
    }

    /**
     * @dev Sets or updates the address of the RWA minter contract.
     * Restricted to the contract owner.
     * @param _minterAddress The address of the new RWA minter contract.
     */
    function setRwaMinter(address _minterAddress) public onlyOwner {
        rwaMinter = _minterAddress;
    }

    // --- RWA Minter Function ---

    /**
     * @dev Mints new RWA tokens. This function can ONLY be called by the `rwaMinter` contract.
     * It includes a safeguard to prevent it from minting the main $ECO token.
     * @param to The address to mint the RWA to.
     * @param id The token ID of the RWA (must be > 0).
     * @param amount The amount of the token to mint (typically 1 for NFTs).
     */
    function mintRWA(address to, uint256 id, uint256 amount) public {
        require(msg.sender == rwaMinter, "EcolabToken: Caller is not the RWA Minter");
        require(id != ECO_TOKEN, "EcolabToken: Cannot mint ECO token via this function");
        _mint(to, id, amount, "");
    }
}