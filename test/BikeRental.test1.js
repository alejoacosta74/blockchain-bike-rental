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

contract('BikeRentalShop contract -> UseCase1: Customer pays rental with Ether (and gets collateralized reduced rate)', ([owner, customer1, customer2, customer3]) => {
    let bikeRental, token, startTime, stopTime;   
    const collateralPremium = 0.8;

    before(async ()=>{        
        token = await Token.new(totalSupply);
        bikeRental = await BikeRental.new(token.address);
        await token.transfer(bikeRental.address, totalSupply, {from: owner});        
    })

    describe('At contract deployment', async ()=>{
        it('Owner should transfer all tokens to BikeRental',async ()=>{
            let bikeRentalTokenBalance = await token.balanceOf(bikeRental.address);
            assert.equal(bikeRentalTokenBalance.toString(), totalSupply)
        }); 
    })

    describe ('UseCase1: #1. customer transfer Ether (above collateral threshold) and starts bike rent ', async ()=> {
        let startReceipt, bikeRentalEtherBalance_1;        
        before (async()=>{
            bikeRentalEtherBalance_1 = await web3.eth.getBalance(bikeRental.address)            
            startReceipt = await bikeRental.startRental(2, {from: customer2, value: tokens('0.0002'),  gasPrice: 0});  
            startTime = parseInt(startReceipt.logs[1].args._startTime, 16);
            //printLogs("result", startReceipt.logs);      
        })        
        
        it('should update customer rental account by amount transferred ', async () =>{
            let customerAccountBalance_1 = await bikeRental.getEtherAccountBalance(customer2);
            assert.equal(customerAccountBalance_1.toString(), tokens('0.0002'), 'Customer ether account not updated correctly');
        })
        it('should update rental ether balance by amount transfered', async () =>{                                    
            let bikeRentalEtherBalance_2 = await web3.eth.getBalance(bikeRental.address)            
            let diff = toBN(bikeRentalEtherBalance_2).sub(toBN(bikeRentalEtherBalance_1));
            assert.equal(diff.toString(), tokens('0.0002'), 'Rental ether balance not updated correctly');
        })
        it('should emit event RentalStart', async () =>{                        
            expectEvent(startReceipt, 'RentalStart');
        })
        it('should emit event BalanceUpdated', async () =>{                        
            expectEvent(startReceipt, 'BalanceUpdated');
        })        
        //it('should revert when customer tries to rent antoher bike witout finishing ongoing rent'
        it('customer should get premium "collateralized" rate', async () =>{                        
            let rate = await bikeRental.getRate();            
            let customerRate = startReceipt.logs[1].args._rate.toString();            
            assert.equal(parseInt(customerRate), parseInt(rate.toString())*collateralPremium, 'Customer assigned rate is not PREMIUM ');
        })
    })

    describe ('UseCase1: #2. customer finishes bike rental', async ()=> {
        let customerAccountBalance_2, stopReceipt, ownerEtherBalance_1 , customerEtherBalance_1;
        before (async()=>{            
            customerAccountBalance_2 = await bikeRental.getEtherAccountBalance(customer2);
            customerEtherBalance_1 = await web3.eth.getBalance(customer2);
            await sleep(5000);
            let mintReceipt = await token.mint(bikeRental.address, tokens('1'), {from: owner});
            //printLogs("result", mintReceipt.logs);                        
            ownerEtherBalance_1 = await web3.eth.getBalance(owner)
            stopReceipt = await bikeRental.stopRental({from: customer2, gasPrice: 0});  
            stopTime = parseInt(stopReceipt.logs[2].args._stopTime, 16); 
            //printLogs("result", stopReceipt.logs);         
            console.log("Rental elapsed time:", (stopTime - startTime));            

        })
        it('Un-spent ether should be returned to customer', async () =>{
            let returnedAmount = stopReceipt.logs[1].args._etherAmount.toString();            
            //let etherfee = stopReceipt.logs[0].args._debitedAmount.toString();            
            customerEtherBalance_2 = await web3.eth.getBalance(customer2);
            let diff = toBN(customerEtherBalance_2).sub(toBN(customerEtherBalance_1));            
            assert.equal(returnedAmount.toString(), diff.toString(), "Customer returned amount is not equal to un-spent amount");
        })
        
        it('Customer rental account balance should be zero', async () =>{
            let customerAccountBalance_3 = await bikeRental.getEtherAccountBalance(customer2);            
            assert.equal(parseInt(customerAccountBalance_3.toString()), 0, "Customer etherAccountBalance is not zero");
        })
        it('owner balance of ether should be incremented by ether worth equal to debited amount', async () =>{
            let debitedAmount = stopReceipt.logs[0].args._debitedAmount.toString();                        
            let ownerEtherBalance_2 = await web3.eth.getBalance(owner);            
            let diff = toBN(ownerEtherBalance_2).sub(toBN(ownerEtherBalance_1));                                    
            assert.equal(debitedAmount, diff.toString(), "Owner ether balance not updated by same amount of debited amount")            
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