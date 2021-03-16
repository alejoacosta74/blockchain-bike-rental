# Bike Rental Shop

<img alt="Bike" src="./docs/bike.png" height="200" />

## About

This repository contains the source code and dependencies required to deploy a Solidity based "BIKE RENTAL SHOP" on Ethereum network.

## Main features

This is a summary of some of the features implemented in the BikeRental contract:

- **Billing**: the rental fee is calculated as a function of time (i.e. duration of rental in seconds)
- **Payment medium**: customers can choose to pay with Ether or Tokens
- **Payment priority**: BikeRental contract will try to fullfil pending payment with *Token* funds from customer's *TokenAccount* as a first priority. If payment is not cancelled 100%, contract will try to fulfill pending payment with *Ether* funds from customer's *EtherAccount* balance as a second priority.
- **Collateral rate**: a premium rate (i.e. 20% cheaper than standard rate) is applicable to those customers that choose to fund their *tokenAccount* or *etherAccount* above a predefined collateral level (i.e. `etherCollateralThreshold` or `tokenCollateralThreshold` ).
- **Un-spent funds**: Token or Ether amount that is not spent when rental finishes, is automatically returned/refunded to customers.
- **Customer debt**: if customer rental fee is greater than available funds, a debt is generated and customer is banned from renting again until debt is cancelled.
- **Contract upgradeability**: additional functions are implemented to enable the update of main business parameters (i.e. minimum balance required, rate, collateral threshold), that only BikeRental **owner** is allowed to execute.

## Rental service start / stop

- The process to start rental is triggered when customer calls function `startRental()` 
- The rental service is finished when customer calls function `stopRental()`

## Smart contracts

The following two smart contracts are required to implement the Bike Rental Shop service:

### 1. BikeRental.sol

Is the main contract, that implements the business logic for the BikeRental Shop.

- Main state variables:

```javascript
    Token token; //Reference to deployed ERC20 Token contract
    address payable wallet; //Address of the owner of Bike Rental Shop    
    uint8 collateralPremium=20; // discount % to be applied to standard rate for PREMIUM "collateralized customers"
    uint8 tokenConversionRate = 2; //conversion rate between Ether and Token, i.e. 1 Ether = 2 Token
    uint rate=10000; //amount of wei to be charged per second (i.e. "standard rate")
    uint etherMinBalance=60000; //minimum amount of ETH required to start bike rental
    uint tokenMinBalance= 120000; //minimum amount of Tokens required to start bike rental   
    uint etherCollateralThreshold=500000; //Threshold amount of ETH required to get PREMIUM "collateralized" rate
    uint tokenCollateralThreshold=1000000; //Threshold amount of Tokens required to get PREMIUM "collateralized" rate
    mapping (address => Customer) customers ; // Record with customers data (i.e., balance, startTie, debt, rate, etc)
    mapping (uint8 => Bike) bikes ; // Available stock of bikes        
```

- Main functions:

```javascript
    //@dev: `buyTokens` used by customer to purchase rental Tokens in exchange of Ether    
    function buyTokens() payable public

    //@dev: `startRental` function is called by customers to start the bike rental service
    //@params: `bikeId` is id of bike to rent     
    function startRental (uint8 _bikeId) payable public{

    //@dev: `stopRental` function is called by customers to stop the bike rental service     
     function stopRental () external {
```

### 2. Token.sol

[![built-with openzeppelin](https://img.shields.io/badge/built%20with-OpenZeppelin-3677FF)](https://docs.openzeppelin.com/)

- ERC20 token compliance smart contract
- Addon functions:

```javascript
function burn(address _to, uint256 _amount) onlyOwner external 
function mint(address _to, uint256 _amount) onlyOwner external
```

## Payment model

Every customer has 2 accounts at BikeRentalShop: *etherAccount* and *tokenAccount*. Each customer may choose to pay the rental of bike via ETHER or TOKENS. 

Below is included a description of each payment model:

---------------------------------------------------------------

### Paying with ETHER

- If the customer chooses to pay bike rental with Ether, he/she calls `startRental()` (*payable*) and sends Ether to **BikeRental.sol** contract in order to provide funds to the *customerEtherAccount*.

- When the customer returns the bike, he/she calls `stopRental()`. 
- At this point the **BikeRental.sol** contract will charge the customer with the corresponding rental fee, issuing a debit from the *customerEtherAccount* and send the Ether amount to the account of the *owner* of the bike rental shop. 
- The remaining (un-spent) ether funds are transferred back to the customer. 

<img alt="figure1" src="./docs/payment1.png" width="500"/>

---------------------------------------------------------------
### Paying with TOKENS

- If the customer wishes to pay bike rental with Tokens, first he/she should purchase Tokens with Ether by calling `buyTokens()` (*payable*). The **BikeRental.sol** contract sends the received Ether to the *owner* of the bike rental shop.
- Then customer should `approve()` the **BikeRental.sol** contract to transfer the desired amount of tokens into the *customerTokenAccount*.
- When customer wants to start the rental, he/she calls `startRental()` and the **BikeRental.sol** contract will execute the transfer of *approved* tokens into the *customerTokenAccount*.

- When the customer returns the bike, he/she calls `stopRental()`.
- At this point the **BikeRental.sol** contract will charge the customer with the corresponding rental fee in units of Tokens, issuing a debit from the *customerTokenAccount* and send the debited amount of Tokens back to the pool.
- The remaining (un-spent) Token funds are transferred back to the customer.

<img alt="figure1" src="./docs/payment2.png" width="500"  />

---------------------------------------------------------------
## Gas optimization
The following is a short list of some considerations taken into account in order to minimize cost of gas

- Enforcement of debt cancelling before rental to avoid revert after updating balances
- `uint8` type storage allocation where possible
- `byte` type instead of `string` type
- use of function `external` instead of `public`
- use events to keep track of data off-chain (i.e. record of bike details)

## Further improvements

- Implement a minimum rental fee (applicable when rental elapsed time is below i.e. 15 minutes)
- Deploy an off-chain Oracle that updates the rental rate according to real time traffic statistics
- Set rate according to time of day (i.e., low, medium, high)
- Develop additional use case tests
- Usage of SafeMath library

## Use case tested

The following are the use cases currently implemented in the truffle test suite

- **Use Case1**: customer transfer Ether (above collateral threshold) and starts/stops bike rent (`BikeRental.test1.js`) 
- **Use Case2**: customer buys tokens, approves transfer of tokens, and starts/stops bike rent (`BikeRental.test2.js`) 
- **Use Case3**: customer buys Tokens, approves transfer of tokens, starts/stops bike rent, debt is created, and customer transfer additional Ether to cancel debt (`BikeRental.test3.js`) 
- **Use Case4**: customer buys Tokens, approves transfer of tokens, transfer Ether, and starts/stops bike rent (`BikeRental.test4.js`) 

## Usage

### Dependencies

  - Truffle
  - Node.js
  - npm
  - Ganache Cli

### Installation

```bash
$ git clone https://github.com/alejoacosta74/BikeRentalShop bikeRentalShop
$ cd bikeRentalShop
$ npm install
$ truffle init
```

### Compile
```bash
$ truffle compile
```

On a separate terminal start Ganache-CLI:
```bash
ganache-cli -m "<seed phrase>" -h 0.0.0.0
```

### Migrate and deploy to Ganache:
```bash
$ truffle migrate --network development
```

### Run tests

```javascript
$ truffle test --network development  //run test suite against Ganache
```

## Expected test outcome

```bash

  Contract: BikeRentalShop contract -> UseCase1: customer transfer Ether (above collateral threshold) and starts/stops bike rent
    At contract deployment
      ✓ Owner should transfer all tokens to BikeRental (107ms)
    UseCase1: #1. customer transfer Ether (above collateral threshold) and starts bike rent
      ✓ should update customer rental account by amount transferred  (81ms)
      ✓ should update rental ether balance by amount transfered
      ✓ should emit event RentalStart
      ✓ should emit event BalanceUpdated
      ✓ customer should get premium "collateralized" rate (89ms)
    UseCase1: #2. customer finishes bike rental
Rental elapsed time: 13
      ✓ Un-spent ether should be returned to customer
      ✓ Customer rental account balance should be zero (131ms)
      ✓ owner balance of ether should be incremented by ether worth equal to debited amount
      ✓ should emit event RentalStop
      ✓ should emit event DebtUpdated
      ✓ should emit event FundsReturned

  Contract: BikeRentalShop contract -> UseCase2: customer buys tokens, approves transfer of tokens, and starts/stops bike rent
    At contract deployment
      ✓ Owner should transfer all tokens to BikeRental (139ms)
    UseCase2: #1. customer buys tokens
      ✓ should increase owner Ether balance with same amount of Ether that customer sent to purchase tokens
      ✓ should decrease customer Ether balance with same amount of Ether that customer sent to purchase tokens
    UseCase2: #2. customer transfer Tokens (above collateral threshold) and starts bike rent
      ✓ should update customer rental account of tokens by amount transferred  (129ms)
      ✓ should update rental balance of tokens by amount transferred (138ms)
      ✓ should emit event RentalStart
      ✓ should emit event BalanceUpdated
      ✓ customer should get premium "collateralized" rate (131ms)
    UseCase2: #3. customer stops bike rent
Rental elapsed time: 13
      ✓ Un-spent tokens should be returned to customer (112ms)
      ✓ Token balance of bikeRental should be incremented by amount of debited tokens (94ms)
      ✓ Customer rental account balance should be set to zero (111ms)
      ✓ should emit event RentalStop
      ✓ should emit event DebtUpdated
      ✓ should emit event FundsReturned

  Contract: BikeRentalShop contract -> UseCase3: customer buys Tokens, approves transfer of tokens, starts/stops bike rent, debt is created, and customer transfer additional Ether to cancel debt
    At contract deployment
      ✓ Owner should transfer all tokens to BikeRental (106ms)
    UseCase3: #1. customer buys tokens
      ✓ should increase owner Ether balance with same amount of Ether that customer sent to purchase tokens
      ✓ should decrease customer Ether balance with same amount of Ether that customer sent to purchase tokens
    UseCase3: #2. customer starts bike rent
      ✓ should update customer rental account of tokens by amount transferred  (143ms)
      ✓ should update rental balance of tokens by amount transferred (120ms)
      ✓ should emit event RentalStart
      ✓ should emit event BalanceUpdated
      ✓ customer should get standard rate (115ms)
    UseCase3: #3. customer stops bike rent and debt is generated
Rental elapsed time: 17
      ✓ Standing debt should be equal to rental fee minus tokens transferred
      ✓ Debited token amount from customer should be equal to tokens transferred amount (109ms)
      ✓ Customer rental account balance should be set zero (77ms)
      ✓ should emit event RentalStop
      ✓ should emit event DebtUpdated
      ✓ should NOT emit event FundsReturned
    UseCase3: #4. Customer tries to rent again while debt is pending
      ✓ startRent should be reverted if debt is pending (741ms)
    UseCase3: #5. customer transfer Ether and debt is cancelled
      ✓ owner balance of ether should be incremented by ether worth equal to debited amount
      ✓ customer standing debt should be 0 (zero) (108ms)
      ✓ customer ether account balance should be 0 (zero) (83ms)
      ✓ should emit event FundsReceived
      ✓ should emit event BalanceUpdated
      ✓ should emit event DebtUpdated
    UseCase3: #6. customer transfer extra Ether
      ✓ owner balance of ether should NOT be incremented if debt is zero
      ✓ customer standing debt should be 0 (zero) (76ms)
      ✓ customer ether account balance should equal to amount of Ether transferred (76ms)
      ✓ should emit event FundsReceived
      ✓ should emit event BalanceUpdated
      ✓ should NOT emit event DebtUpdated

  Contract: BikeRentalShop contract -> UseCase4: customer buys Tokens, approves transfer of tokens, transfer Ether, and starts/stops bike rent
    At contract deployment
      ✓ Owner should transfer all tokens to BikeRental (81ms)
    UseCase4: #1. customer buys tokens
      ✓ should increase owner Ether balance with same amount of Ether that customer sent to purchase tokens
      ✓ should decrease customer Ether balance with same amount of Ether that customer sent to purchase tokens
    UseCase4: #2. customer sends 40.000 wei and starts bike rent
      ✓ should update customer rental account of tokens by amount transferred  (78ms)
      ✓ should update rental balance of tokens by amount transferred (96ms)
      ✓ should emit event RentalStart
      ✓ should emit event BalanceUpdated
      ✓ customer should get standard rate (83ms)
    UseCase4: #3. customer stops bike rent, price is deducted from Tokens and Ether and remaining funds are returned
Rental elapsed time: 15
      ✓ Debited token amount from customer should be equal to tokens transferred amount
      ✓ Debited ether amount from customer should be equal to total fee minus tokens debited from customer
      ✓ Customer rental Token account balance should be set zero (115ms)
      ✓ should emit event RentalStop
      ✓ should emit event DebtUpdated
      ✓ should emit event FundsReturned


  67 passing (47s)
```

## BTC address

*bc1q89aalael3kr5vhjn6ss4g4fscxnesc9gw8sfyryhzq7nhdphlm9semr93f*
