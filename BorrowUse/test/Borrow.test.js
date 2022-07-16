const Borrow = artifacts.require("BorrowandUse");
let catchRevert = require("../execption").catchRevert;
contract("borrow",(accounts) => {

    let admin = accounts[0];
    let user = accounts[1];
    let user1 = accounts[2];
    let user2 = accounts[3];
    let user3 = accounts[4];
    let user4 = accounts[5];
    let user5 = accounts[6];
    let user6 = accounts[7];
    let user7 = accounts[8];
    let user8 = accounts[9];

    it("Should be able to deploy successfully",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.address;
        console.log("The deployed address is:",beta.toString());
        assert(beta != "");
    });

    it("Can Check ETH Balance of user",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.ETHBalanceChecker({from:admin});
        console.log("The ETH Balance of this account is:",beta.toString());
        assert(beta != "");
    });

    it("Can Check Token Balance of user",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.TokenBalance({from:admin});
        console.log("The Balance is:",beta.toString());
        assert(beta !== "");
    });

    it("Can Recieve ETH",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.RecieveETH({from:admin,value:1000000000});
        const gamma = await alpha.ContractETHBalance();
        console.log("The Contract Balance is:",gamma.toString());
        assert.equal(gamma,1000000000);
    });

    it("Should Have exactly 1000000 Tokens",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.ContractTokens();
        console.log("The Tokens in the Contract is:",beta.toString());
        assert.equal(beta,1000000);
    });

    it("Should Revert When NonOwner tries to Transfer tokens",async()=>{
        const alpha = await Borrow.deployed();
       await catchRevert(alpha.TransferTokens(user1,1000,{from:user2}));
    });

    it("Admin Can Transfer Tokens",async()=>{
        const alpha = await Borrow.deployed();
        const alpha1 = await alpha.ContractTokens();
        console.log("Contract Balance before Transfer is:",alpha1.toString());
        const alpha2 = await alpha.TokenBalance({from:user});
        console.log("Token Balance of user before Transfer is:",alpha2.toString());
        const beta = await alpha.TransferTokens(user,100,{from:admin});
        const gamma = await alpha.TokenBalance({from:user});
        const gamma1 = await alpha.ContractTokens();
        console.log("Token Balance of user after Transfer is:",gamma.toString());
        console.log("Contract Balance after Transfer is:",gamma1.toString());
        assert(alpha1 != gamma1) ;
    });

    it("Can Borrow ETH",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.RecieveETH({from:admin,value:1000000000});
        const gamma = await alpha.TransferTokens(user1,100000,{from:admin});
        const beta0 = await alpha.TokenBalance({from:user1});
        console.log("Token Balance before borrowing is:",beta0.toString());
        const meta = await alpha.BorrowETH(20,{from:user1});
        const alpha1 = await alpha.TokenBalance({from:user1});
        console.log("Token Balance after borrowing is:",alpha1.toString());
        assert(alpha1 != beta0);
    });

    it("Can Borrow Tokens",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.BorrowTokens(100000,{from:user3,value:200});
        const gamma = await alpha.TokenBalance({from:user3});
        console.log("The Balance is:",gamma.toString());
        assert(gamma != 0); 
    });

    it("Cannot Borrow ETH if Token Balance is insufficient",async()=>{
        const alpha = await Borrow.deployed();
        catchRevert(alpha.BorrowETH(20,{from:user2}));
    });

    it("Cannot Borrow ETH when ETH has been borrowed",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.RecieveETH({from:admin,value:1000000000});
        const gamma = await alpha.TransferTokens(user4,100000,{from:admin});
        const meta = await alpha.BorrowETH(20,{from:user4});
        catchRevert(alpha.BorrowETH(20,{from:user4}));
    });

    it("Can Check Max Tokens User Balance Can Borrow",async()=>{ 
        const alpha = await Borrow.deployed();
        const beta = await alpha.CheckMaxBorrowTokens({from:admin});
        console.log("Max Borrowable Tokens is:",beta.toString());
        assert(beta != 0);
    });

    it("Can Check Max ETH User Can Borrow",async()=>{
        const alpha = await Borrow.deployed();
        const meta = await alpha.TransferTokens(user2,10000,{from:admin});
        const gamma = await alpha.CheckMaxBorrowETH({from:user2});
        assert.equal(gamma,20);
    });

    it("Should Revert When User tries to borrow tokens when already borrowed",async()=>{
        const alpha = await Borrow.deployed();
        const gamma = await alpha.ReturnBorrowedETH({value:20,from:user4});
        const beta = await alpha.BorrowTokens(100000,{from:user4,value:200});
        await catchRevert(alpha.BorrowTokens(100000,{from:user4,value:200}))
    });

    it("Cannot Borrow Tokens and ETH at the same Time",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.RecieveETH({from:admin,value:1000000000});
        const gamma = await alpha.TransferTokens(user2,100000,{from:admin});
        const meta = await alpha.BorrowETH(20,{from:user2});
        catchRevert(alpha.BorrowTokens(100000,{from:user2,value:200}));
    });

    it("Should Revert When user sends 0 wei when borrowing tokens",async()=>{
        const alpha = await Borrow.deployed();
        catchRevert(alpha.BorrowTokens(100000,{from:user6,value:0}))
    });

    it("Can Return Borrowed ETH",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.RecieveETH({from:admin,value:1000000000});
        const gamma = await alpha.TransferTokens(user7,10000,{from:admin});
        const meta = await alpha.BorrowETH(20,{from:user7});
        const beta1 = await alpha.ReturnBorrowedETH({from:user7,value:20});
        const alpha1 = await alpha.TokenBalance({from:user7});
        console.log("Balance is:",alpha1.toString());
        assert(alpha1 == 10000);
    });

    it("Can Return Borrowed Tokens",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.BorrowTokens(100000,{from:user8,value:200});
        const gamma = await alpha.isTokenBorrowed({from:user8});
        const meta = await alpha.ReturnBorrowedTokens({from:user8});
        const gamma1 = await alpha.isTokenBorrowed({from:user8});
        assert(gamma != gamma1);
    });

    it("Returns Tokens Back When ETH is Returned",async()=>{
        const alpha = await Borrow.deployed();
        const gintoki = await alpha.ReturnBorrowedETH({value:20,from:user2});
        const beta = await alpha.RecieveETH({from:admin,value:1000000000});
        const gamma = await alpha.TransferTokens(user2,10000,{from:admin});
        const gamma0 = await alpha.TokenBalance({from:user2});
        console.log("Initial Token Balance is:",gamma0.toString());
        const meta = await alpha.BorrowETH(20,{from:user2});
        const gamma1 = await alpha.TokenBalance({from:user2});
        console.log("Balance after borrowing is:",gamma1.toString())
        const beta1 = await alpha.ReturnBorrowedETH({from:user2,value:20});
        const alpha1 = await alpha.TokenBalance({from:user2}); 
        console.log("Balance After returning borrowed ETH is:",alpha1.toString());
        assert.equal(alpha1,120000);
    });

    it("Returns ETH Back When Tokens is Returned",async()=>{
        const alpha = await Borrow.deployed();
        const gamma = await alpha.ContractETHBalance(); 
        const beta = await alpha.BorrowTokens(100000,{from:user2,value:200});
        const meta = await alpha.ReturnBorrowedTokens({from:user2});
        const gamma1 = await alpha.ContractETHBalance();
        assert(gamma != gamma1);
    });

    it("Should Revert when user tries to borrow tokens that exceed Contract Balance",async()=>{
        const alpha = await Borrow.deployed();
        await catchRevert(alpha.BorrowTokens(1000000000000,{from:user4,value:2000000000}));
    });

    it("Can return ETH in the contract",async()=>{
        const alpha = await Borrow.deployed();
        const beta = alpha.ContractETHBalance();
        assert(beta != "");
    });

    it("Returns the Value of ETH borrowed",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.RecieveETH({from:admin,value:1000000000});
        const gamma = await alpha.TransferTokens(user7,10000,{from:admin});
        const meta = await alpha.BorrowETH(20,{from:user7});
        const gamma1 = await alpha.ValueETHBorrowed({from:user7});
        assert(gamma1 == 20);
    });

    it("Returns the Value of Tokens borrowed",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.RecieveETH({from:admin,value:1000000000});
        const meta = await alpha.BorrowTokens(100000,{from:admin,value:200});
        const gamma1 = await alpha.ValueTokensBorrowed({from:admin});
        assert(gamma1 != 0);
    });

    it("Can Return Times ETH has been Borrowed from the contract",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.ReturnTimesETHBorrowed();
        console.log("The number of times ETH Borrowed is:",beta.toString())
        assert(beta != "");
    });

    it("Can Return Times Tokens has been Borrowed from the contract",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.ReturnTimesTokensBorrowed();
        assert(beta != "");
    });
    it("Can return owner address",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.ReturnOwner();
        assert(beta != "");
    });
    it("Can return rate",async()=>{
        const alpha = await Borrow.deployed();
        const beta = await alpha.ReturnRate();
        assert.equal(beta,500);
    })
    
    
    



   
});