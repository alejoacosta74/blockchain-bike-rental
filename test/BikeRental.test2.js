const { assert } = require('chai');

const BikeRental = artifacts.require('BikeRental');
const Token = artifacts.require('Token');
const totalSupply = '1000000000000000000000000';
const toBN = web3.utils.toBN;
const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

require('chai')
    .use(require('chai-as-promised'))
    .should();

//helper function to convert human readble numbers to wei units
function tokens(n){
    return web3.utils.toWei(n, 'ether');    
}
//helper function to print events
function printLogs(title, logs) {
    for (let i = 0; i < logs.length; i++) {
        console.log();
        console.log(`${title} event #${i + 1}:`);
        console.log(JSON.stringify(logs[i].event, null, 4));
        console.log(JSON.stringify(logs[i].args, null, 4));
    }
}
//helper function to simulate rental time duration
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}   

contract('BikeRentalShop contract -> UseCase2: Customer buys tokens, pays rental with tokens (and gets collateralized reduced rate)', ([owner, customer1, customer2, customer3]) => {
    let bikeRental, token, startTime, stopTime, customerTokenBalance_1, bikeRentalTokenBalance_1;   
    const collateralPremium = 0.8;

    before(async ()=>{        
        token = await Token.new(totalSupply);
        bikeRental = await BikeRental.new(token.address);
        await token.transfer(bikeRental.address, totalSupply, {from: owner});        
    })

    describe('At contract deployment', async ()=>{
        it('Owner should transfer all tokens to BikeRental',async ()=>{
            let bikeRentalTokenBalance_0 = await token.balanceOf(bikeRental.address);
            assert.equal(bikeRentalTokenBalance_0.toString(), totalSupply)
        }); 
    })

    describe('UseCase2: #1. customer buys tokens', async ()=>{
        let buyReceipt, ownerEtherBalance_1, customerEtherBalance_1;        
        before (async()=>{
            ownerEtherBalance_1 = await web3.eth.getBalance(owner);            
            customerEtherBalance_1 = await web3.eth.getBalance(customer2);            
            buyReceipt = await bikeRental.buyTokens({from: customer2, value: tokens('0.0002'), gasPrice: 0 });
            //printLogs("buyTokens", buyReceipt.logs);
            customerTokenBalance_1 = await token.balanceOf(customer2);

        })        
        it('should increase owner Ether balance with same amount of Ether that customer sent to purchase tokens', async () =>{
            let ownerEtherBalance_2 = await web3.eth.getBalance(owner);            
            let diff = toBN(ownerEtherBalance_2).sub(toBN(ownerEtherBalance_1));
            let etherAmount = buyReceipt.logs[0].args._etherAmount.toString();            
            assert.equal(diff.toString(), etherAmount.toString(), 'Owner ether balance not updated correctly after purchase of tokens');
        })
        it('should decrease customer Ether balance with same amount of Ether that customer sent to purchase tokens', async () =>{
            let customerEtherBalance_2 = await web3.eth.getBalance(customer2);            
            let diff = toBN(customerEtherBalance_1).sub(toBN(customerEtherBalance_2));
            let etherAmount = buyReceipt.logs[0].args._etherAmount.toString();
            assert.equal(diff.toString(), etherAmount.toString(), 'Customer ether balance not updated correctly after purchase of tokens');
        })
    })

    describe ('UseCase2: #2. customer transfer Tokens (above collateral threshold) and starts bike rent ', async ()=> {
        let startReceipt, approveReceipt;        
        before (async()=>{
            approveReceipt = await token.approve(bikeRental.address, customerTokenBalance_1.toString(), {from: customer2});
            bikeRentalTokenBalance_1 = await token.balanceOf(bikeRental.address);
            startReceipt = await bikeRental.startRental(2, {from: customer2});  
            startTime = parseInt(startReceipt.logs[2].args._startTime, 16);
            //printLogs("startRental", startReceipt.logs);      
        })        
        
        it('should update customer rental account of tokens by amount transferred ', async () =>{
            let customerAccountBalance_1 = await bikeRental.getTokenAccountBalance(customer2);
            assert.equal(customerAccountBalance_1.toString(), customerTokenBalance_1.toString(), 'Customer account not updated correctly');
        })
        it('should update rental balance of tokens by amount transferred', async () =>{                                    
            let bikeRentalTokenBalance_2 = await token.balanceOf(bikeRental.address);                        
            let diff = toBN(bikeRentalTokenBalance_2).sub(toBN(bikeRentalTokenBalance_1));            
            assert.equal(diff.toString(), customerTokenBalance_1.toString(), 'Bike Rental balance not updated correctly');
        })
        it('should emit event RentalStart', async () =>{                        
            expectEvent(startReceipt, 'RentalStart');
        })
        it('should emit event BalanceUpdated', async () =>{                        
            expectEvent(startReceipt, 'BalanceUpdated');
        })        
        it('customer should get premium "collateralized" rate', async () =>{                        
            let rate = await bikeRental.getRate();            
            let customerRate = startReceipt.logs[2].args._rate.toString();            
            assert.equal(parseInt(customerRate), parseInt(rate.toString())*collateralPremium, 'Customer assigned rate is not PREMIUM ');
        })
    })

    describe ('UseCase2: #3. customer stops bike rent', async ()=> {
        let stopReceipt;
        before (async()=>{            
            await sleep(5000);            
            let mintReceipt = await token.mint(customer3, tokens('1'), {from: owner});
            //printLogs("result", mintReceipt.logs);                                    
            stopReceipt = await bikeRental.stopRental({from: customer2});  
            stopTime = parseInt(stopReceipt.logs[2].args._stopTime, 16); 
            //printLogs("stopRental", stopReceipt.logs);         
            console.log("Rental elapsed time:", (stopTime - startTime)); 
        })
        it('Un-spent tokens should be returned to customer', async () =>{
            let tokenDebitedAmount = stopReceipt.logs[0].args._tokenDebitedAmount.toString();
            let customerTokenBalance_2 = await token.balanceOf(customer2);
            let customerTokensReturned = toBN(customerTokenBalance_1).sub(toBN(customerTokenBalance_2));            
            assert.equal(customerTokensReturned.toString(), tokenDebitedAmount.toString(), "Amount returned to customer is not equal to un-spent amount");
        })
        it('Token balance of bikeRental should be incremented by amount of debited tokens', async () =>{
            let tokenDebitedAmount = stopReceipt.logs[0].args._tokenDebitedAmount.toString();
            let bikeRentalTokenBalance_3 = await token.balanceOf(bikeRental.address);            
            let diff = toBN(bikeRentalTokenBalance_3).sub(toBN(bikeRentalTokenBalance_1));            
            assert.equal(diff.toString() , tokenDebitedAmount, "bikeRental token balance not updated by same amount of debited amount")            
        })
        
        it('Customer rental account balance should be set to zero', async () =>{
            let customerAccountBalance_2 = await bikeRental.getTokenAccountBalance(customer2);            
            assert.equal(parseInt(customerAccountBalance_2.toString()), 0, "Customer Tokenbalance is not zero");
        })
        it('should emit event RentalStop', async () =>{                        
            expectEvent(stopReceipt, 'RentalStop');
        })
        it('should emit event DebtUpdated', async () =>{                        
            expectEvent(stopReceipt, 'DebtUpdated');
        })
        it('should emit event FundsReturned', async () =>{                        
            expectEvent(stopReceipt, 'FundsReturned');
        })
    })    
})