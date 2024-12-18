const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const {DEVLOPMENTCHAINS} = require("../../config-constans")

DEVLOPMENTCHAINS.includes(network.name)
? describe.skip
: describe("test fundme contract", async function () {
    let fundMe
    let account1
    beforeEach(async function () {
        await deployments.fixture(["all"])
        account1 = (await getNamedAccounts()).account1
        const fundMeDeployment = await deployments.get("FundMe")
        // 这里是使用的已经部署好的合约地址来获取一个调用函数，
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
    })

    // 测试转入fund和提取getFund函数
    it("fund and getFund successfully",
        async function() {
            // make sure target reached
            await fundMe.fund({value:ethers.parseEther("0.001")})
            // 等待locktime
            await new Promise(resolve => setTimeout(resolve,181 *1000))
            // make sure we can get receipt
            const getFundTx = await fundMe.getFund()
            const getFundReceipt = await getFundTx.wait()
            expect(getFundReceipt).
            to.emit(fundMe,"FundWithdrawByOwner").
            withArgs(ethers.parseEther("0.001"))
        }
    )
   
    // fund 和refund 函数
    it("fund and refund successfully",
        async function() {
            // make sure target reached
            await fundMe.fund({value:ethers.parseEther("0.0002")})
            // 等待locktime
            await new Promise(resolve => setTimeout(resolve,181 *1000))
            // make sure we can get receipt
            const refundTx = await fundMe.refund()
            const refundReceipt = await refundTx.wait()
            expect(refundReceipt).
            to.emit(fundMe,"RefundByFunder").
            withArgs(account1,ethers.parseEther("0.0002 "))
        }
    )


})


