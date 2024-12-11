// import ethers.js
// create main function
// 需要两个账户 （owner和非owner）
// fund
// 获取合约余额
// 检查map里面 的值有没有变化

// execute main function
const { ethers } = require("hardhat")

async function main() {
    console.log("main is start")
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    // deploy contract from factory
    const fundMe = await fundMeFactory.deploy(3600) // 这里代表发送和deploy的操作，而写入链上需要等待验证。
    await fundMe.waitForDeployment()
    //console.log("this contract is depoly successfully,addrss is :"+fundMe.target)
    console.log(`this contract is depoly successfully,addrss is :${fundMe.target}`)

    // hre -> 代表hardhat verify 运行时环境,run->可以在js环境中使用命令行命令
    // 验证合约
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY != "") {
        fundMe.deploymentTransaction().wait(5)
        console.log("on wait 5 transfer")
        await verifyFundMe(fundMe.target, [3600])
    } else {
        console.log("verify is stop..........")
    }

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


}

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: [args],
    });
}

// main() 表示需要执行函数
main().then().catch((error) => {
    console.error("this has error:", error)
    process.exit(1) // 正常退出为0，不正常退出为1
})