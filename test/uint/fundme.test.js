const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")// 模拟时间的流逝
const {DEVLOPMENTCHAINS} = require("../../config-constans")

!DEVLOPMENTCHAINS.includes(network.name)
? describe.skip
: describe("test fundme contract", async function () {
    let fundMe
    let account1
    let account2
    let fundMeaccount2
    let mockV3Aggregator
    beforeEach(async function () {
        await deployments.fixture(["all"])
        account1 = (await getNamedAccounts()).account1
        account2 = (await getNamedAccounts()).account2
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        const fundMeDeployment = await deployments.get("FundMe")
        // 这里是使用的已经部署好的合约地址来获取一个调用函数，
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        // 这里相当于指定调用者是谁，来构造调用对象
        fundMeaccount2 = await ethers.getContract("FundMe", account2) 
    })

    it("test ownner is msg.sender", async function () {
        await fundMe.waitForDeployment()
        assert.equal(account1, (await fundMe.owner()))
    })
   
    it ("test if the datafeed is assigned correctly",async function() {
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.dataFeed()),mockV3Aggregator.address)

    })
    // deploy contract from factory

    it("window open,value is less than minimum,fund failed",async function(){
        expect(fundMe.fund({value:ethers.parseEther("0.00001")})).
        to.be.revertedWith("need send more ETH.")// wei

    })


    it("window open, value is greater minimun,fund success",
        async function(){
            await fundMe.fund({value:ethers.parseEther("0.1")})
            const balance = await fundMe.funderAmountMap(account1)
            expect(balance).to.equal(ethers.parseEther("0.1"))
        }
    )

     // fund getfund refund
     it("window colsed,value grater than minimum,fund failed",
        async function () {
            // make sure the window is colsed
            await helpers.time.increase(200)
            await helpers.mine()
            // value is greater minimum value
           expect(fundMe.fund({value:ethers.parseEther("0.1")})).
           to.be.revertedWith("window is close.")// wei
        }
    )

    // getFund unit 
     /**
      * onlyOwner,
      * window closed,
      * balance more than target
      */
    it("contract balance is not enough,no transfer",
        async function() {
            await helpers.time.increase(200)
            await helpers.mine()
            expect(fundMe.getFund()).
           to.be.revertedWith("target is smart,not cashout.")// wei
        }
    )

    it("getFund call is owner",
        async function() {
            await helpers.time.increase(200)
            await helpers.mine()
            assert.equal(account1,(await fundMe.owner()))
        }
    )
    
    it("getFund call is other,window colsed,getFund failed",
        async function() {
            await helpers.time.increase(200)
            await helpers.mine()
            await expect(fundMeaccount2.getFund()).
            to.be.revertedWith("not owner.")// wei
        }
    )


    it("getFund success",
        async function(){
            fundMe.fund({value:ethers.parseEther("1")})
            await helpers.time.increase(200)
            await helpers.mine()
             // 2: 使用事件打印，来确认转账是否成功，成功的话就会打印事件
            await expect(fundMe.getFund()).
            to.emit(fundMe,"FundWithdrawByOwner")
            .withArgs(ethers.parseEther("1"))
            // 1：写一个方法来获取合约的余额
            // const balance = await fundMe.getContractBalance()
            // console.log("contract balance:",balance)
            // expect(balance).to.equal(ethers.parseEther("0"))
        }
    )

    // refund
    /**
     * windowClosed
     * target not reached
     * funder has balance
     * 
     */
    it("window open,target not reached,funder has balance",
        async function() {
            fundMe.fund({value:ethers.parseEther("0.1")})
            await expect(fundMe.refund()).
            to.be.revertedWith("windows not closed.");
        }
    )

    it("window closed,target reach,funder has balance",
        async function() {
            fundMe.fund({value:ethers.parseEther("1")})
            await helpers.time.increase(200)
            await helpers.mine()
            await expect(fundMe.refund()).
            to.be.revertedWith("target is ok,not cashout.");
        }
    )
    it("window closed,target not reach,funder does not has balance",
        async function() {
            fundMe.fund({value:ethers.parseEther("0.0001")})
            await helpers.time.increase(200)
            await helpers.mine()
            await expect(fundMeaccount2.refund()).
            to.be.revertedWith("you no recharge.");
        }
    )

    it("window closed,target not reach,funder has balance",
        async function() {
            fundMe.fund({value:ethers.parseEther("0.1")})
            await helpers.time.increase(200)
            await helpers.mine()
            await expect(fundMe.refund()).
            to.emit(fundMe,"RefundByFunder").
            withArgs(account1,ethers.parseEther("0.1"))
        }
    )



})


