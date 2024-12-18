// function deployFunction() {
//     console.log("this is a deploy func")
// }

const { network } = require("hardhat")
const { DEVLOPMENTCHAINS,CONFIRMATIONS, networkConfig, LOCK_TIME } = require("../config-constans")

// module.exports.default = deployFunction

// module.exports =async(hre) => {
//     getNamedAccounts = hre.getNamedAccounts
//     const deployment = hre.deployments
//     console.log("this is a deploy func")
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    console.log("this is a deploy func 01")
    let dataFeedAddr
    let confirmations

    if (DEVLOPMENTCHAINS.includes(network.name)) {
        const MockV3Aggreator = await deployments.get("MockV3Aggregator")
        dataFeedAddr = MockV3Aggreator.address
        confirmations = 0
    } else {
        console.log("now chainId is:",network.config.chainId)
        addr = networkConfig[network.config.chainId].ethUsdtAddr
        dataFeedAddr = addr
        confirmations = CONFIRMATIONS
    }
    console.log("MockV3Aggregator addr is:",dataFeedAddr)

    const fundMe = await deploy("FundMe", {
        from: account1,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations:confirmations,
    })

    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY != "") {
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddr],
        });
    } else {
        console.log("now network not is sepolia,no verify")
    }
}

module.exports.tags = ["all", "fundme"]