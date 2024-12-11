const {task} = require("hardhat/config")

task("interactFundMe","interact with FundMe contract").addParam("addr","fundme contract address").setAction(async(taskArgs,hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    const fundMe = fundMeFactory.attach(taskArgs.addr)
    
    // 获取两个账户
     const [account1, account2] = await ethers.getSigners()

     // 1账户转账到合约
     const fundToaccount1Tx = await fundMe.connect(account1).fund({ value: ethers.parseEther("0.001") })
     await fundToaccount1Tx.wait // 等待合约调用成功
 
     // 2账户转账到合约 这个connect不写的话默认连接的是第一个账户
     const fundToAccount2Tx = await fundMe.connect(account2).fund({ value: ethers.getSigners("0.001") })
     await fundToAccount2Tx.wait
 
     // 查看合约余额
     const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
     console.log("contract balance is:", balanceOfContract)
 
     account1Balance=fundMe.funderAmountMap(account1.address)
     account2Balance=fundMe.funderAmountMap(account2.address)
     console.log("balance of account1:",account1Balance)
     console.log("balance of account2:",account2Balance)
})
module.exports = {}
