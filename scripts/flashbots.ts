import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    // Deploy FakeNFT Contract
    const fakeNFT = await ethers.getContractFactory("FakeNFT");
    const FakeNFT = await fakeNFT.deploy();
    await FakeNFT.deployed();

    console.log("Address of Fake NFT Contract:", FakeNFT.address);

    // Create a Alchemy WebSocket 
    let websocketUrl: any = process.env.GOERLI_WEBSOCKET_URL;
    const provider = new ethers.providers.WebSocketProvider(
        websocketUrl,
        "goerli"
    );

    // Wrap your private key in the ethers Wallet class
    let privateKey: any = process.env.PRIVATE_KEY;
    const signer = new ethers.Wallet(privateKey, provider);

    // Create a Flashbots Provider which will forward the request to the relayer
    // Which will further send it to the flashbot miner
    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        signer,
        // URL for the flashbots relayer
        "https://relay-goerli.flashbots.net",
        "goerli"
    );

    provider.on("block", async (blockNumber) => {
        console.log("Block Number: ", blockNumber);
        // Send a bundle of transactions to the flashbot relayer
        const bundleResponse = await flashbotsProvider.sendBundle(
            [
                {
                    transaction: {
                        // ChainId for the Goerli network
                        chainId: 5,
                        // EIP-1559
                        type: 2,
                        // Value of 1 FakeNFT
                        value: ethers.utils.parseEther("0.01"),
                        // Address of the FakeNFT
                        to: FakeNFT.address,
                        // In the data field, we pass the function selector of the mint function
                        data: FakeNFT.interface.getSighash("mint()"),
                        // Max Gas Fes you are willing to pay
                        maxFeePerGas: BigNumber.from(10).pow(9).mul(3),
                        // Max Priority gas fees you are willing to pay
                        maxPriorityFeePerGas: BigNumber.from(10).pow(9).mul(2),
                    },
                    signer: signer,
                },
            ],
            blockNumber + 1
        );

        // If an error is present, log it
        if ("error" in bundleResponse) {
            console.log(bundleResponse.error.message);
        }
    });
}

main();

