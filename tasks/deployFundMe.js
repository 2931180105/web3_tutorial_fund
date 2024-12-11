const {task} = require("hardhat/config")

task("deployFundMe","deploy and verify FundMe contract.").setAction(async(taskArgs,hre)=> {
    console.log("main is start")
    const fundMeFactory = await  ethers.getContractFactory("FundMe")
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
})


async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: [args],
    });
}
module.exports = {}