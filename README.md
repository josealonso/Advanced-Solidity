### Merkle Trees

`npm i @openzeppelin/contracts keccak256 merkletreejs`

- Solidity file `Whitelist.sol`
- Test file `merkle-root.ts`

### Flashloans

You borrow without any collateral, because you return the money in the same transaction.
It allows to do arbitrage.

Four steps, in order:

- Your contract calls a function on a Flash Loan provider, like Aave, indicating which asset you want and how much of it. That function is called `flashLoanSimple`.
- The Flash Loan provider sends the assets to your contract, and calls back into your contract for a different function, `executeOperation`.
- `executeOperation` is all custom code you must have written - you go wild with the money here. At the end, you approve the Flash Loan provider to withdraw back the borrowed assets, along with a premium.
- The Flash Loan provider takes back the assets it gave you, along with the premium.
 
A long flashloan operation can cause a `griefing attack`.

npm i @aave/core-v3
