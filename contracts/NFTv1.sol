// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.10;
pragma solidity ^0.8.4;
/*
It imports ERC721Upgradeable and OwnableUpgradeable because the original ERC721 and Ownable contracts 
have a constructor which cant be used with proxy contracts.
The UUPSUpgradeable Contract provides with the upgradeTo(address) function 
which has to be put on the Implementation Contract in case of a UUPS proxy pattern.
*/
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract NFTv1 is
    Initializable,
    ERC721Upgradeable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    // Note how we created an initialize function and then added the
    // initializer modifier which ensure that the
    // initialize function is only called once
    function initialize() public initializer {
        // Note how instead of using the ERC721() constructor, we have to manually initialize it
        // Same goes for the Ownable contract where we have to manually initialize it
        __ERC721_init("LW3NFT", "LW3NFT");
        __Ownable_init();
        _mint(msg.sender, 1);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {
        // we just added an `onlyOwner` modifier.
    }
}
