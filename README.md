### Merkle Trees

`npm i @openzeppelin/contracts keccak256 merkletreejs`

- Solidity file `Whitelist.sol`
- Test file `merkle-root.ts`

### Flashloans

It's a loan without any collateral, because you return the money in the same transaction.
Applications: arbitrage, liquidations.

Four steps, in order:

- Your contract calls a function on a Flash Loan provider, like Aave, indicating which asset you want and how much of it. That function is called `flashLoanSimple`.
- The Flash Loan provider sends the assets to your contract, and calls back into your contract for a different function, `executeOperation`.
- `executeOperation` is all custom code you must have written - you go wild with the money here. At the end, you approve the Flash Loan provider to withdraw back the borrowed assets, along with a premium.
- The Flash Loan provider takes back the assets it gave you, along with the premium.
 
A long flashloan operation can cause a `griefing attack`.

- These modules have to be installed: `npm i @aave/core-v3`

#### Documentation

- https://docs.aave.com/developers/core-contracts/pool
- https://github.com/aave/aave-v3-core/blob/master/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol


### Upgradeable Contracts

To upgrade our contracts we use something called the *Proxy Pattern*. A contract is split into two contracts - the *Proxy* Contract and the *Implementation* contract.

The Proxy Contract is responsible for managing the state of the contract which involves persistent storage whereas Implementation Contract is responsible for executing the logic and doesn't store any persistent state. User calls the Proxy Contract which further does a delegatecall to the Implementation Contract so that it can implement the logic.

This pattern becomes interesting when Implementation Contract can be replaced which means the logic which is executed can be replaced by another version of the Implementation Contract without affecting the state of the contract which is stored in the proxy.

There are mainly three ways in which we can replace/upgrade the Implementation Contract:

- **Transparent Implementation**
- **UUPS Implementation**
- Diamond Implementation

We will however only focus on Transparent and UUPS because they **are the most commonly used ones**.

To upgrade the Implementation Contract you will have to use some method like `upgradeTo(address)` which will essentially change the address of the Implementation Contract from the old one to the new one.
But the important part lies in where should we keep the `upgradeTo(address)` function 
- keep it in the Proxy Contract ---> Transparent Proxy Pattern. 
- keep it in the Implementation Contract ---> UUPS Proxy Pattern. 

#### Initializer

When deploying a new smart contract, the code inside the constructor is not a part of the contract's runtime bytecode because it is only needed during the deployment phase and runs only once. Now because when Implementation Contract was deployed it was initially not connected to the Proxy Contract as a reason any state change that would have happened in the constructor is now not there in the Proxy Contract which is used to maintain the overall state.

As a reason Proxy Contracts are unaware of the existence of constructors. Therefore, instead of having a constructor, we use something called an **initializer function** which is called by the Proxy Contract once the Implementation Contract is connected to it. This function does exactly what a constructor is supposed to do but is now included in the runtime bytecode as it behaves like a regular function and is callable by the Proxy Contract.

Using OpenZeppelin contracts, you can use their `Initialize.sol` contract which makes sure that your initialize function is executed only once just like a contructor.

#### Issues with UUPS Proxy Pattern

Since the `upgradeTo()` function exists on the side of the Implementation contract, the developer has to worry about the implementation of this function which may sometimes be complicated and because more code has been added, it increases the possibility of attacks. 
**This function also needs to be in all the versions of the Implementation Contract** which are upgraded which introduces a risk if maybe the developer forgets to add this function and then the contract can no longer be upgraded.


### Flashbots

- The only Ethereum testnet supported by Flashbots is `goerli`.

The `flashbots.ts` script mints an NFT using Flashbots.

#### Explaining the script

 The reason why we created a WebSocket provider this time is because we want to create a socket to listen to every new block that comes in Goerli network. **HTTP Providers**, as we had been using previously, work on a request-response model, where a client sends a request to a server, and the server responds back.
  In the case of **WebSockets**, however, the client opens a connection with the WebSocket server once, and then the server continuously sends them updates as long as the connection remains open. Therefore the client does not need to send requests again and again.
  We listen for each block and send a request in each block so that when the **coinbase miner**(miner of the current block) is a flashbots miner, our transaction gets included.

   We specify the chainId which is 5 for Goerli, type which is 2 because we will use the **Post-London Upgrade** gas model which is **EIP-1559**. 

We specify value which is 0.01 because that's the amount for minting 1 NFT and the to address which is the address of FakeNFT contract.

Now for data we need to specify the function selector which is the first four bytes of the Keccak-256 (SHA-3) hash of the name and the arguments of the function. This will determine which function are we trying to call, in our case, it will be the mint function.

Then we specify the maxFeePerGas and maxPriorityFeePerGas to be 3 GWEI and 2 GWEI respectively. Note the values I got here are from looking at the transactions which were mined previously in the network and what Gas Fees were they using.

also, `1 GWEI = 10*WEI = 10*10^8 = 10^9`

We want the transaction to be mined in the next block, so we add 1 to the current blocknumber and send this bundle of transactions.

After sending the bundle, we get a `bundleResponse` on which we check if there was an error or not, if yes we log it.

Note, getting a response doesn't guarantee that our bundle will get included in the next block or not. To check if it will get included in the next block or not you can use `bundleResponse.wait()` but in this simple bot, we will just wait patiently for a few blocks and observe.
