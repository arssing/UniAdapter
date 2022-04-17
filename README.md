## Contracts
### Kovan

[Adapter](https://kovan.etherscan.io/address/0x0851067c85b5ed81cf16bd66144bb2ccc1ebf592)

Address: 0x0851067c85b5ed81cf16bd66144bb2ccc1ebf592
## Deploy
```shell
 npx hardhat run scripts/deploy-adapter.ts 
```
## Tasks
```shell
npx hardhat create-pair --address 0x0851067C85B5ED81Cf16bD66144BB2CCC1eBf592 --address0 0x93d83a5ea6294D0c641049EaDc79F28CE732aF9f --address1 0xF1320faca3a1146a5E1a55E75aC7E34eCe1FCF79
npx hardhat add-liq --address 0x0851067C85B5ED81Cf16bD66144BB2CCC1eBf592 --address0 0x93d83a5ea6294D0c641049EaDc79F28CE732aF9f --address1 0xF1320faca3a1146a5E1a55E75aC7E34eCe1FCF79 --amount0 10 --amount1 15
npx hardhat remove-liq --address 0x0851067C85B5ED81Cf16bD66144BB2CCC1eBf592 --address0 0x93d83a5ea6294D0c641049EaDc79F28CE732aF9f --address1 0xF1320faca3a1146a5E1a55E75aC7E34eCe1FCF79 --liq 1
npx hardhat add-liq-eth --address 0x0851067C85B5ED81Cf16bD66144BB2CCC1eBf592 --addrweth 0xd0A1E359811322d97991E03f863a0C30C2cF029C --address1 0xF1320faca3a1146a5E1a55E75aC7E34eCe1FCF79 --amount0 0.02 --amount1 3
npx hardhat remove-liq-eth --address 0x0851067C85B5ED81Cf16bD66144BB2CCC1eBf592 --pairaddr 0xD0B9aa341fa7C98dF8921A05D7eb8Ff6C40F0204 --address1 0xF1320faca3a1146a5E1a55E75aC7E34eCe1FCF79 --liq 0.0000000002
npx hardhat swap --address 0x0851067C85B5ED81Cf16bD66144BB2CCC1eBf592 --address0 0x93d83a5ea6294D0c641049EaDc79F28CE732aF9f --address1 0xF1320faca3a1146a5E1a55E75aC7E34eCe1FCF79 --amount0 1
npx hardhat swap-path --address 0x0851067C85B5ED81Cf16bD66144BB2CCC1eBf592 --path 0x93d83a5ea6294D0c641049EaDc79F28CE732aF9f,0xF1320faca3a1146a5E1a55E75aC7E34eCe1FCF79,0xf778d0b1D03592733Ce817A745305637c25cAb90 --amount0 1
```
## Coverage
File                   |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------------|----------|----------|----------|----------|----------------|
 contracts/            |    88.33 |     37.5 |    84.21 |    88.33 |                |
  Token.sol            |      100 |      100 |      100 |      100 |                |
  UniAdapter.sol       |      100 |      100 |      100 |      100 |                |
  WETH.sol             |       65 |     37.5 |    57.14 |       65 |... 36,37,51,52 |
 contracts/interfaces/ |      100 |      100 |      100 |      100 |                |
  IERC20.sol           |      100 |      100 |      100 |      100 |                |
All files              |    88.33 |     37.5 |    84.21 |    88.33 |                |