import { expect } from "chai";
import { Address } from "cluster";
import { ethers } from "hardhat";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

function encodeLeaf(anAddress: string, spots: number) {
  // Same as "abi.encodePacked" in Solidity
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint64"],
    [anAddress, spots]
  );
}

describe("Check if merkle root is working", function () {
  it("Should be able to verify if a given address is in whitelist or not", async function () {
    // Get a bunch of test addresses
    const [owner, addr1, addr2, addr3, addr4, addr5] =
      await ethers.getSigners();

    // Create an array of elements you wish to encode in the Merkle Tree
    const list = [
      encodeLeaf(owner.address, 2),
      encodeLeaf(addr1.address, 2),
      encodeLeaf(addr2.address, 2),
      encodeLeaf(addr3.address, 2),
      encodeLeaf(addr4.address, 2),
      encodeLeaf(addr5.address, 2),
    ];

    // Create the Merkle Tree using the hashing algorithm `keccak256`
    // Make sure to sort the tree so that it can be produced deterministically regardless
    // of the order of the input list

    let merkleTree = new MerkleTree(list, keccak256, {
      hashLeaves: true,
      sortPairs: true,
    });
    // Compute the Merkle root
    const root = merkleTree.getHexRoot();  // getRoot() return a Buffer, not a string
    // const proof = merkleTree.getProof(list.toString());   // (leaves[2]);

    // Deploy the Whitelist contract
    const whitelist = await ethers.getContractFactory("Whitelist");
    const Whitelist = await whitelist.deploy(root);
    await Whitelist.deployed();

    // Compute the Merkle proof of the owner address
    // off-chain. The leaf node is the hash of that value.
    const leaf = keccak256(list[0]);
    const proof = merkleTree.getHexProof(leaf);

    // Provide the Merkle Proof to the contract, and ensure that it can verify
    // that this leaf node was indeed part of the Merkle Tree
    let verified = await Whitelist.checkInWhitelist(proof, 2);
    expect(verified).to.equal(true);

    // Provide an invalid Merkle Proof to the contract, and ensure that
    // it can verify that this leaf node was NOT part of the Merkle Tree
    verified = await Whitelist.checkInWhitelist([], 2);
    expect(verified).to.equal(false);
  });
});
