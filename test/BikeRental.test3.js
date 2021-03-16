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

contract('BikeRentalShop contract -> UseCase3: customer buys Tokens, pays rental with Tokens, debt is created, and customer transfer Ether to cancel debt', ([owner, customer1, customer2, customer3]) => {
    let bikeRental, token, startTime, stopTime, stopReceipt, startReceipt, customerTokenBalance_1, bikeRentalTokenBalance_1;
    let  bikeRentalTokenBalance_2, customerAccountBalance_1, buyReceipt, ownerEtherBalance_1, customerEtherBalance_1;    
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

    describe('UseCase3: #1. customer buys tokens', async ()=>{                 
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
            let customerEtherBalance_2 = await web3.eth.getBalance(customer2);            
            let diff = toBN(customerEtherBalance_1).sub(toBN(customerEtherBalance_2));
            let etherAmount = buyReceipt.logs[0].args._etherAmount.toString();
            assert.equal(diff.toString(), etherAmount.toString(), 'Customer ether balance not updated correctly after purchase of tokens');
        })
    })

    describe ('UseCase3: #2. customer transfer Tokens (below collateral threshold) and starts bike rent ', async ()=> {
        before (async()=>{
            approveReceipt = await token.approve(bikeRental.address, customerTokenBalance_1.toString(), {from: customer2});
            bikeRentalTokenBalance_1 = await token.balanceOf(bikeRental.address);
            startReceipt = await bikeRental.startRental(2, {from: customer2});  
            startTime = parseInt(startReceipt.logs[2].args._startTime, 16);
            //printLogs("startRental", startReceipt.logs);      
        })        
        
        it('should update customer rental account of tokens by amount transferred ', async () =>{
            customerAccountBalance_1 = await bikeRental.getTokenAccountBalance(customer2);
            assert.equal(customerAccountBalance_1.toString(), customerTokenBalance_1.toString(), 'Customer account not updated correctly');
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

    describe ('UseCase3: #3. customer stops bike rent and debt is generated', async ()=> {        
        before (async()=>{            
            await sleep(10000);            
            let mintReceipt = await token.mint(customer3, tokens('1'), {from: owner});
            //printLogs("result", mintReceipt.logs);                                    
            stopReceipt = await bikeRental.stopRental({from: customer2});            
            stopTime = parseInt(stopReceipt.logs[1].args._stopTime, 16); 
            //printLogs("stopRental", stopReceipt.logs);         
            console.log("Rental elapsed time:", (stopTime - startTime)); 
        })
        it('Standing debt should be equal to rental fee minus tokens transferred', async () =>{
            let rentFeeEtherAmount = stopReceipt.logs[0].args._origAmount.toString();
            let debtEtherAmount = stopReceipt.logs[0].args._pendingAmount.toString();                                                
            let debtTokenAmount = toBN(debtEtherAmount).muln(tokenConversionRate);;
            let rentFeeTokenAmount = toBN(rentFeeEtherAmount).muln(tokenConversionRate);
            let expectedTokenDebt =  toBN(rentFeeTokenAmount).sub(toBN(customerAccountBalance_1));            
            assert.equal(expectedTokenDebt, debtTokenAmount.toString(), "Calculated pending debt is not as expected ");
        })
        it('Debited token amount from customer should be equal to tokens transferred amount', async () =>{
            let tokenDebitedAmount = stopReceipt.logs[0].args._tokenDebitedAmount.toString();
            let bikeRentalTokenBalance_3 = await token.balanceOf(bikeRental.address);                       
            let diff = toBN(bikeRentalTokenBalance_3).sub(toBN(bikeRentalTokenBalance_2));            
            assert.equal(customerAccountBalance_1,tokenDebitedAmount, 'Debited amount of Tokens from customer is not equal to amount of Tokens transferred')        
        })
        
        it('Customer rental account balance should be set zero', async () =>{
            let customerAccountBalance_2 = await bikeRental.getTokenAccountBalance(customer2);            
            assert.equal(parseInt(customerAccountBalance_2.toString()), 0, "Customer Tokenbalance is not zero");
        })
        it('should emit event RentalStop', async () =>{                        
            expectEvent(stopReceipt, 'RentalStop');
        })
        it('should emit event DebtUpdated', async () =>{                        
            expectEvent(stopReceipt, 'DebtUpdated');
        })
        it('should NOT emit event FundsReturned', async () =>{                        
            expectEvent.notEmitted(stopReceipt, 'FundsReturned');
        })
    })    

    describe('UseCase3: #4. Customer tries to rent again while debt is pending', async ()=>{           
        it('startRent should be reverted if debt is pending', async () =>{
            await expectRevert(bikeRental.startRental(1, {from: customer2}), "Not allowed to rent if debt is pending");  
        })
    })

    describe('UseCase3: #5. customer transfer Ether and debt is cancelled', async ()=>{
        let ownerEtherBalance_1;        
        before (async()=>{
            let debtEtherAmount = stopReceipt.logs[0].args._pendingAmount.toString();
            ownerEtherBalance_1 = await web3.eth.getBalance(owner);
            transferFundReceipt = await bikeRental.transferFunds({from: customer2, value: debtEtherAmount.toString(), gasPrice: 0 });
            //printLogs("transferFunds", transferFundReceipt.logs);  
        })
        it('owner balance of ether should be incremented by ether worth equal to debited amount', async () =>{
            let debitedAmount = transferFundReceipt.logs[1].args._debitedAmount.toString();
            let ownerEtherBalance_2 = await web3.eth.getBalance(owner);            
            let diff = toBN(ownerEtherBalance_2).sub(toBN(ownerEtherBalance_1));            
            assert.equal(debitedAmount.toString(), diff.toString(), "Owner ether balance not updated by same amount of debited amount")            
        })
        it('customer standing debt should be 0 (zero)', async () =>{
            let pendingDebt = transferFundReceipt.logs[1].args._pendingAmount.toString();
            let customerDebt = await bikeRental.getDebt(customer2);
            assert.equal(pendingDebt.toString(), '0', 'customer debt is not zero');
            assert.equal(customerDebt.toString(), '0', 'customer debt is not zero');
        })
        it('customer ether account balance should be 0 (zero)', async () =>{
            let customerAccountBalance_3 = await bikeRental.getEtherAccountBalance(customer2)
            assert.equal(customerAccountBalance_3.toString(), '0', 'customer debt is not zero');
        })
        it('should emit event FundsReceived', async () =>{                        
            expectEvent(transferFundReceipt, 'FundsReceived');
        })
        it('should emit event BalanceUpdated', async () =>{                        
            expectEvent(transferFundReceipt, 'BalanceUpdated');
        })
        it('should emit event DebtUpdated', async () =>{                        
            expectEvent(transferFundReceipt, 'DebtUpdated');
        })        
    })
    describe('UseCase3: #6. customer transfer extra Ether', async ()=>{
        let ownerEtherBalance_1;        
        before (async()=>{            
            ownerEtherBalance_1 = await web3.eth.getBalance(owner);
            transferFundReceipt = await bikeRental.transferFunds({from: customer2, value: tokens('6').toString(), gasPrice: 0 });
            //printLogs("transferFunds", transferFundReceipt.logs);  
        })
        it('owner balance of ether should NOT be incremented if debt is zero', async () =>{            
            let ownerEtherBalance_2 = await web3.eth.getBalance(owner);            
            let diff = toBN(ownerEtherBalance_2).sub(toBN(ownerEtherBalance_1));            
            assert.equal(diff.toString(),'0', "Owner ether balance updated even when debt is zero")            
        })
        it('customer standing debt should be 0 (zero)', async () =>{
            let customerDebt = await bikeRental.getDebt(customer2);
            assert.equal(customerDebt.toString(), '0', 'customer debt is not zero');
        })
        it('customer ether account balance should equal to amount of Ether transferred', async () =>{
            let customerAccountBalance_3 = await bikeRental.getEtherAccountBalance(customer2)
            assert.equal(customerAccountBalance_3.toString(), tokens('6').toString() , 'customer ether balance not equal to amount of transferred Ether');
        })
        it('should emit event FundsReceived', async () =>{                        
            expectEvent(transferFundReceipt, 'FundsReceived');
        })
        it('should emit event BalanceUpdated', async () =>{                        
            expectEvent(transferFundReceipt, 'BalanceUpdated');
        })    
        it('should NOT emit event DebtUpdated', async () =>{                        
            expectEvent.notEmitted(transferFundReceipt, 'DebtUpdated');
        })
    })

})