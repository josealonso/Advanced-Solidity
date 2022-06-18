// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./NFTv1.sol";

contract NFTv2 is NFTv1 {
    function test() public pure returns (string memory) {
        return "upgraded";
    }
}
