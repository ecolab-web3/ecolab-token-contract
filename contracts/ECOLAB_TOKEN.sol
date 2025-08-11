// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title EcolabToken (V1.1.0)
 * @notice This is the core contract for the E-co.lab ecosystem, designed to be upgradeable.
 * @dev Developed by the E-co.lab Team. Flexible version supporting dynamic initialization.
 * @custom:oz-upgrades-unsafe-allow constructor
 */
contract EcolabToken is Initializable, ERC1155Upgradeable, OwnableUpgradeable {

    // --- Constants ---

    uint256 public constant ECO_TOKEN = 0;

    // --- State Variables ---

    string public name;
    string public symbol;
    address public rwaMinter;

    // --- Initializer ---

    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract, setting name, symbol, owner, and base metadata URI.
     * Can only be called once by the proxy deployment process.
     * @param initialOwner The address that will have administrative control over the contract.
     * @param _name The name of the token collection (e.g., "E-co.lab Token" or "E-co.lab Fuji Test Token").
     * @param _symbol The symbol for the token collection (e.g., "ECO" or "ECO_FUJI").
     * @param _uri The base URI for token metadata.
     */
    function initialize(
        address initialOwner,
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) public initializer {
        __ERC1155_init(_uri);
        __Ownable_init(initialOwner);
        
        name = _name;
        symbol = _symbol;
    }

    // --- Admin Functions (Owner Only) ---
    // (As funções mint, burn, setRwaMinter, etc., permanecem exatamente as mesmas)
    
    function mint(address to, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(to, id, amount, data);
    }

    function burn(address from, uint256 id, uint256 amount) public onlyOwner {
        _burn(from, id, amount);
    }

    function setRwaMinter(address _minterAddress) public onlyOwner {
        rwaMinter = _minterAddress;
    }
    
    // --- RWA Minter Function ---
    // (A função mintRWA permanece exatamente a mesma)

    function mintRWA(address to, uint256 id, uint256 amount) public {
        require(msg.sender == rwaMinter, "EcolabToken: Caller is not the RWA Minter");
        require(id != ECO_TOKEN, "EcolabToken: Cannot mint ECO token via this function");
        _mint(to, id, amount, "");
    }
}