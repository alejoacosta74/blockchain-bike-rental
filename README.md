# Bike Rental Shop

<img alt="Bike" src="./docs/bike.png" height="200" />

## About

This repository contains the source code and dependencies required to deploy a "bike rental shop" on Ethereum network.

## Main features

- **Billing**: the rental fee is calculated as a function of time (i.e. duration of rental in seconds)
- **Payment**: customers can choose to pay with Ether or Tokens
- **Collateral rate**: a premium rate (i.e. 20% cheaper than standard rate) is applicable to customer that decide to fund their accounts with collateral
- **Un-spent funds**: Token or Ether amount that is not spent when rental finishes, is automatically returned/refunded to customers.
- **Customer debt**: if customer rental fee is greater than available funds, a debt is generated and customer is banned from renting again until debt is cancelled 

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
    mapping (uint8 => Bike) bikes ; // Stock of bikes        
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

- Each customer has 2 accounts at BikeRentalShop: Ether account and Token account.
- Customers may choose to pay the rental of bike via ETHER or TOKENS.

---------------------------------------------------------------

### Paying with ETHER

- If the customer chooses to pay bike rental with Ether, he/she calls `startRental()` (*payable*) and sends Ether to **BikeRental.sol** contract in order to provide funds to the *customerEtherAccount*.

- When the customer returns the bike, he/she calls `stopRental()`. 
- At this point the **BikeRental.sol** contract will charge the customer with the corresponding rental fee, issuing a debit from the *customerEtherAcount* and send the Ether amount to the account of the *owner* of the bike rental shop. 
- The remaining (un-spent) ether funds are transferred back to the customer. 

<img alt="figure1" src="./docs/payment1.png" width="500"/>

---------------------------------------------------------------
### Paying with TOKENS

- If the customer wishes to pay bike rental with Tokens, first he/she should purchase Tokens with Ether by calling `buyTokens()` (*payable*). The **BikeRental.sol** contract sends the received Ether to the *owner* of the bike rental shop.
- Then customer should `approve()` the **BikeRental.sol** contract to transfer the desired amount of tokens into the *customerTokenAcount*.
- When customer wants to start the rental, he/she calls `startRental()` and the **BikeRental.sol** contract will execute the transfer of tokens into the *customerTokenAcount*.

- When the customer returns the bike, he/she calls `stopRental()`.
- At this point the **BikeRental.sol** contract will charge the customer with the corresponding rental fee, issuing a debit from the *customerTokenAccount* and send the amount  back to the pool of tokens.
- The remaining (un-spent) Token funds are transferred back to the customer.

<img alt="figure1" src="./docs/payment2.png" width="500"  />

---------------------------------------------------------------
## Gas optimization
The following is a short list of some considerations taken into account in order to minimize cost of gas

- Enforcement of debt cancelling before rental to avoid revert after updating balances
- uint8 storage allocation where possible
- byte instead of string
- use of function `external` instead of `public`
- use events to keep track of data off-chain (i.e. record of bike details)

## Further improvements

- Implement a minimum rental fee (applicable when rental elapsed time is below i.e. 15 minutes)
- Deploy an off-chain Oracle that updates the rental rate according to real time traffic statistics
- Set rate according to time of day (i.e., low, medium, high)
- Ellaborate additional use case tests
- Usage of SafeMath library

## Use case tested

The following are the use cases currently implemented in the truffle test suite

- **Use Case1**: customer transfer Ether (above collateral threshold) and starts/stops bike rent (`BikeRental.test1.js`) 
- **Use Case2**: customer buys tokens, pays rental with tokens (above collateral threshold) and starts/stops bike rent (`BikeRental.test2.js`) 
- **Use Case3**: customer buys Tokens, pays rental with Tokens (token amount below rental fee), debt is created, and customer transfer Ether to cancel debt (`BikeRental.test3.js`) 

## Usage

- Installation

```bash
$ git clone https://github.com/alejoacosta74/solidityVotingPower bikeRentalShop
$ cd bikeRentalShop
$ npm install
$ truffle init
```

- Compile & migrate to local dev
```bash
$ truffle compile
```

On a separate terminal start Ganache-CLI:
```bash
ganache-cli -m "<seed phrase>" -h 0.0.0.0
```

- Migrate and deploy to Ganache:
```bash
$ truffle migrate --network development
```

- Run tests

```javascript
$ truffle test --network development  //run test suite against Ganache
```

## Expected test outcome

```bash
  Contract: BikeRentalShop contract -> UseCase1: Customer pays rental with Ether (and gets collateralized reduced rate)
    At contract deployment
      ✓ Owner should transfer all tokens to BikeRental (127ms)
    UseCase1: #1. customer transfer Ether (above collateral threshold) and starts bike rent
      ✓ should update customer rental account by amount transferred  (119ms)
      ✓ should update rental ether balance by amount transfered
      ✓ should emit event RentalStart
      ✓ should emit event BalanceUpdated
      ✓ customer should get premium "collateralized" rate (118ms)
    UseCase1: #2. customer finishes bike rental
Rental elapsed time: 6
      ✓ Un-spent ether should be returned to customer
      ✓ Customer rental account balance should be zero (115ms)
      ✓ owner balance of ether should be incremented by ether worth equal to debited amount
      ✓ should emit event RentalStop
      ✓ should emit event DebtUpdated
      ✓ should emit event FundsReturned

  Contract: BikeRentalShop contract -> UseCase2: Customer buys tokens, pays rental with tokens (and gets collateralized reduced rate)
    At contract deployment
      ✓ Owner should transfer all tokens to BikeRental (98ms)
    UseCase2: #1. customer buys tokens
      ✓ should increase owner Ether balance with same amount of Ether that customer sent to purchase tokens
      ✓ should decrease customer Ether balance with same amount of Ether that customer sent to purchase tokens
    UseCase2: #2. customer transfer Tokens (above collateral threshold) and starts bike rent
      ✓ should update customer rental account of tokens by amount transferred  (113ms)
      ✓ should update rental balance of tokens by amount transferred (93ms)
      ✓ should emit event RentalStart
      ✓ should emit event BalanceUpdated
      ✓ customer should get premium "collateralized" rate (103ms)
    UseCase2: #3. customer stops bike rent
Rental elapsed time: 108
      ✓ Un-spent tokens should be returned to customer (100ms)
      ✓ Token balance of bikeRental should be incremented by amount of debited tokens (105ms)
      ✓ Customer rental account balance should be set to zero (111ms)
      ✓ should emit event RentalStop
      ✓ should emit event DebtUpdated
      ✓ should emit event FundsReturned

  Contract: BikeRentalShop contract -> UseCase3: customer buys Tokens, pays rental with Tokens, debt is created, and customer transfer Ether to cancel debt
    At contract deployment
      ✓ Owner should transfer all tokens to BikeRental (98ms)
    UseCase3: #1. customer buys tokens
      ✓ should increase owner Ether balance with same amount of Ether that customer sent to purchase tokens
      ✓ should decrease customer Ether balance with same amount of Ether that customer sent to purchase tokens
    UseCase3: #2. customer transfer Tokens (below collateral threshold) and starts bike rent
      ✓ should update customer rental account of tokens by amount transferred  (102ms)
      ✓ should update rental balance of tokens by amount transferred (107ms)
      ✓ should emit event RentalStart
      ✓ should emit event BalanceUpdated
      ✓ customer should get standard rate (100ms)
    UseCase3: #3. customer stops bike rent and debt is generated
Rental elapsed time: 17
      ✓ Standing debt should be equal to rental fee minus tokens transferred
      ✓ Debited token amount from customer should be equal to tokens transferred amount (122ms)
      ✓ Customer rental account balance should be set zero (112ms)
      ✓ should emit event RentalStop
      ✓ should emit event DebtUpdated
      ✓ should NOT emit event FundsReturned
    UseCase3: #4. Customer tries to rent again while debt is pending
      ✓ startRent should be reverted if debt is pending (923ms)
    UseCase3: #5. customer transfer Ether and debt is cancelled
      ✓ owner balance of ether should be incremented by ether worth equal to debited amount
      ✓ customer standing debt should be 0 (zero) (104ms)
      ✓ customer ether account balance should be 0 (zero) (102ms)
      ✓ should emit event FundsReceived
      ✓ should emit event BalanceUpdated
      ✓ should emit event DebtUpdated
    UseCase3: #6. customer transfer extra Ether
      ✓ owner balance of ether should NOT be incremented if debt is zero
      ✓ customer standing debt should be 0 (zero) (219ms)
      ✓ customer ether account balance should equal to amount of Ether transferred (103ms)
      ✓ should emit event FundsReceived
      ✓ should emit event BalanceUpdated
      ✓ should NOT emit event DebtUpdated


  53 passing (34s)
```


