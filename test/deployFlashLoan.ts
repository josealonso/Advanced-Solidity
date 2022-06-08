import { expect, assert } from "chai";
import hre, { ethers } from "hardhat";
// import { BigNumber } from "ethers";

import { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } from "../config";

/*
We use a feature of Hardhat known as Mainnet Forking which can simulate having the same state as mainnet, 
but it will work as a local development network. 
That way you can interact with deployed protocols and test complex interactions locally.
*/
describe("Deploy a Flash Loan", function () {
    it("Should take a flash loan and be able to return it", async function () {
        const flashLoanExample = await ethers.getContractFactory(
            "FlashLoanExample"
        );

        const _flashLoanExample = await flashLoanExample.deploy(
            // Address of the PoolAddressProvider: you can find it here: https://docs.aave.com/developers/deployed-contracts/v3-mainnet/polygon
            POOL_ADDRESS_PROVIDER
        );
        await _flashLoanExample.deployed();

        const token = await ethers.getContractAt("IERC20", DAI);
        const BALANCE_AMOUNT_DAI = ethers.utils.parseEther("2000");

        /* Impersonate the DAI_WHALE account to be able to send transactions from that account.
        Even though Hardhat doesnt have the private key of DAI_WHALE in the local testing env, 
        it will act as if we already know its private key and can sign transactions on the behalf of DAI_WHALE. 
        It will also have the amount of DAI as it has on the polygon mainnet
        */
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_WHALE],
        });
        const signer = await ethers.getSigner(DAI_WHALE);
        await token
            .connect(signer)
            // Next line can fail because that holder is not a whale anymore
            // .transfer(_flashLoanExample.address, BALANCE_AMOUNT_DAI); // Sends our contract 2000 DAI from the DAI_WHALE
            .transfer(_flashLoanExample.address, ethers.utils.parseEther("1"));
        const tx = await _flashLoanExample.createFlashLoan(DAI, 1000); // Borrow 1000 DAI in a Flash Loan with no upfront collateral
        await tx.wait();
        const remainingBalance = await token.balanceOf(_flashLoanExample.address); // Check the balance of DAI in the Flash Loan contract afterwards
        expect(remainingBalance.lt(BALANCE_AMOUNT_DAI)).to.be.true; // We must have less than 2000 DAI now, since the premium was paid from our contract's balance
    });
});
