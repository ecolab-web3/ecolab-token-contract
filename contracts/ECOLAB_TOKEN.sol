// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title EcolabToken (V1.1.0)
 * @notice This is the core contract for the E-co.lab ecosystem, designed to be upgradeable.
 * @dev Developed by the E-co.lab Team. Flexible version supporting dynamic initialization.
 * @custom:oz-upgrades-unsafe-allow constructor
 */
contract EcolabToken is Initializable, ERC1155Upgradeable, OwnableUpgradeable, UUPSUpgradeable {

    // --- Constants ---
    uint256 public constant ECO_TOKEN = 0;

    // --- State Variables ---
    string public name;
    string public symbol;
    address public rwaMinter;

    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) public initializer {
        __ERC1155_init(_uri);
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        
        name = _name;
        symbol = _symbol;
    }
    
    // --- UUPS Upgrade Mechanism ---
    /// @custom:oz-upgrades-unsafe-allow-reachable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // --- Admin Functions (Owner Only) ---
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
    function mintRWA(address to, uint256 id, uint256 amount) public {
        require(msg.sender == rwaMinter, "EcolabToken: Caller is not the RWA Minter");
        require(id != ECO_TOKEN, "EcolabToken: Cannot mint ECO token via this function");
        _mint(to, id, amount, "");
    }
}