# MySave Smart Contract

MySave is a Solidity smart contract that allows users to deposit and withdraw either Ether or ERC20 Signortokens.

## Features

- Deposit Ether: Users can deposit Ether into the contract.
- Deposit Tokens: Users can deposit ERC20 tokens into the contract.
- Withdraw Ether: Users can withdraw deposited Ether from the contract.
- Withdraw Tokens: Users can withdraw deposited ERC20 tokens from the contract.

## Prerequisites

- Node.js
- Hardhat

## Getting Started

1. Clone the repository:

```
git clone <repository-url>
```

2. Install dependencies:

```
npm install
```

3. Compile the contracts:

```
npx hardhat compile
```

4. Deploy the contract:

```
npx hardhat run scripts/deploy.js --network <network-name>
```

## Usage

1. Deploy the contract using Hardhat or any other Ethereum development environment.
2. Use the provided functions to deposit or withdraw Ether and ERC20 tokens.


## Testing

Tests for this contract can be found in the `test/` directory. To run the tests, execute:

```
npx hardhat test
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
