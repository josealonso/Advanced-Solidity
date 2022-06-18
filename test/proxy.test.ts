import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { NFTv1, NFTv1__factory, NFTv2 } from "../typechain";

describe("ERC721 Upgradeable", function () {
  it("Should deploy an upgradeable ERC721 Contract", async function () {
    const NFTv1 = await ethers.getContractFactory("NFTv1");
    const NFTv2 = await ethers.getContractFactory("NFTv2");

    /**
     * This function comes from the @openzeppelin/hardhat-upgrades library. 
     * It uses the upgrades class to call the deployProxy function and specifies the kind as uups. 
     * When the function is called it deploys the Proxy Contract, the Implementation Contract and connects them both. 
     * Note that the initialize function can be named anything else, its just that deployProxy by default 
     * calls the function with name initialize for the initializer but you can modify it by changing the defaults. 
     */
    // let contr = NFTv2.deploy(); let c2 = await (await contr).deployed();
    // c2.test();

    let proxyContract = await hre.upgrades.deployProxy(NFTv1, {
      kind: "uups",
    });
    const [owner] = await ethers.getSigners();
    const ownerOfToken1 = await proxyContract.ownerOf(1);

    expect(ownerOfToken1).to.equal(owner.address);

    proxyContract = await hre.upgrades.upgradeProxy(proxyContract, NFTv2);  // as NFTv2;
    expect(await proxyContract.test()).to.equal("upgraded");
  });
});
