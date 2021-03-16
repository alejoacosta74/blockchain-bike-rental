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

contract('BikeRentalShop contract -> UseCase4: customer buys Tokens, approves transfer of tokens, transfer Ether, and starts/stops bike rent', ([owner, customer1, customer2, customer3]) => {
    let bikeRental, token, startTime, stopTime, stopReceipt, startReceipt, customerTokenBalance_1, bikeRentalTokenBalance_1;
    let  bikeRentalTokenBalance_2, customerTokenAccount_1, customerEtherAccount_1, buyReceipt, ownerEtherBalance_1, customerEtherBalance_1, customerEtherBalance_2, customerEtherBalance_3;    
    const collateralPremium = 0.8;
    const tokenConversionRate = 2

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

    describe('UseCase4: #1. customer buys tokens', async ()=>{                 
        before (async()=>{
            ownerEtherBalance_1 = await web3.eth.getBalance(owner);            
            customerEtherBalance_1 = await web3.eth.getBalance(customer2);            
            buyReceipt = await bikeRental.buyTokens({from: customer2, value: '60001', gasPrice: 0 });
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
            customerEtherBalance_2 = await web3.eth.getBalance(customer2);            
            let diff = toBN(customerEtherBalance_1).sub(toBN(customerEtherBalance_2));
            let etherAmount = buyReceipt.logs[0].args._etherAmount.toString();
            assert.equal(diff.toString(), etherAmount.toString(), 'Customer ether balance not updated correctly after purchase of tokens');
        })
    })

    describe ('UseCase4: #2. customer sends 40.000 wei and starts bike rent ', async ()=> {
        before (async()=>{
            approveReceipt = await token.approve(bikeRental.address, customerTokenBalance_1.toString(), {from: customer2});
            bikeRentalTokenBalance_1 = await token.balanceOf(bikeRental.address);            
            startReceipt = await bikeRental.startRental(2, {from: customer2, value: '40000', gasPrice: 0});  
            startTime = parseInt(startReceipt.logs[2].args._startTime, 16);
            customerEtherBalance_3 = await web3.eth.getBalance(customer2);
            //printLogs("startRental", startReceipt.logs);      
        })        
        
        it('should update customer rental account of tokens by amount transferred ', async () =>{
            customerTokenAccount_1 = await bikeRental.getTokenAccountBalance(customer2);
            assert.equal(customerTokenAccount_1.toString(), customerTokenBalance_1.toString(), 'Customer account not updated correctly');
        })
        it('should update rental balance of tokens by amount transferred', async () =>{                                    
            bikeRentalTokenBalance_2 = await token.balanceOf(bikeRental.address);                        
            let diff = toBN(bikeRentalTokenBalance_2).sub(toBN(bikeRentalTokenBalance_1));            
            assert.equal(diff.toString(), customerTokenBalance_1.toString(), 'Bike Rental balance not updated correctly');
        })
        it('should emit event RentalStart', async () =>{                        
            expectEvent(startReceipt, 'RentalStart');
        })
        it('should emit event BalanceUpdated', async () =>{                        
            expectEvent(startReceipt, 'BalanceUpdated');
        })        
        it('customer should get standard rate', async () =>{                        
            let rate = await bikeRental.getRate();            
            let customerRate = startReceipt.logs[2].args._rate.toString();            
            assert.equal(parseInt(customerRate), parseInt(rate.toString()), 'Customer assigned rate is stadard ');
        })
    })

    describe ('UseCase4: #3. customer stops bike rent, price is deducted from Tokens and Ether and remaining funds are returned', async ()=> {        
        before (async()=>{            
            await sleep(8000);            
            let mintReceipt = await token.mint(customer3, tokens('1'), {from: owner});
            //printLogs("result", mintReceipt.logs); 
            customerEtherAccount_1 =  await bikeRental.getEtherAccountBalance(customer2);                                  
            stopReceipt = await bikeRental.stopRental({from: customer2, gasPrice: 0});            
            stopTime = parseInt(stopReceipt.logs[2].args._stopTime, 16); 
            //printLogs("stopRental", stopReceipt.logs);         
            console.log("Rental elapsed time:", (stopTime - startTime)); 
        })
        it('Debited token amount from customer should be equal to tokens transferred amount', async () =>{
            let tokenDebitedAmount = stopReceipt.logs[0].args._tokenDebitedAmount.toString();
            assert.equal(customerTokenAccount_1.toString(),tokenDebitedAmount, 'Debited amount of Tokens from customer is not equal to amount of Tokens transferred')        
        })
        it('Debited ether amount from customer should be equal to total fee minus tokens debited from customer', async () =>{
            let Event_etherDebitedAmount = stopReceipt.logs[0].args._debitedAmount.toString();            
            let Event_etherReFunded = stopReceipt.logs[1].args._etherAmount.toString();

            let customerEtherBalance_4 = await web3.eth.getBalance(customer2);
            let refundedEtherAmount = toBN(customerEtherBalance_4).sub(toBN(customerEtherBalance_3));
            let debitedEtherAmount = toBN(customerEtherAccount_1).sub(toBN(refundedEtherAmount));            
            assert.equal(debitedEtherAmount.toString(), Event_etherDebitedAmount.toString(), "Debited ETHER amount from customer should be difference between `TotalRentalFee - tokenAccount balance`");
            assert.equal(refundedEtherAmount.toString(), Event_etherReFunded.toString(), "Refunded ETHER amount to customer should be difference between `EtherAccount balance - debited Ether`");
        })
        
        it('Customer rental Token account balance should be set zero', async () =>{
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