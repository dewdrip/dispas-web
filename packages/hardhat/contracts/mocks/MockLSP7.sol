// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import { _LSP4_TOKEN_TYPE_TOKEN } from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import { LSP7DigitalAsset } from "@lukso/lsp7-contracts/contracts/LSP7DigitalAsset.sol";

contract MockLSP7 is
    LSP7DigitalAsset(
        "MockLSP7", // token name
        "MTKN", // token symbol
        msg.sender, // contract owner
        _LSP4_TOKEN_TYPE_TOKEN, // token type as uint256 (0 for Token, 1 for NFT, 2 for Collection)
        false // make the token non divisible (true = 0 decimals, false = 18 decimals)
    )
{
    function mint() external {
        _mint(msg.sender, 1 ether, false, "");
    }
}
