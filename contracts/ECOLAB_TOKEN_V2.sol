// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ECOLAB_TOKEN.sol";

contract EcolabTokenV2 is EcolabToken {
    string public version;

    function initializeV2() public reinitializer(2) {
        version = "V2";
    }
}