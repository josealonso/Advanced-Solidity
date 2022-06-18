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
