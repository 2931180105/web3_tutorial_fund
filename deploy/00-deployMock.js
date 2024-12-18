const { network } = require("hardhat")
const { DECIMAL, INITIAL_ANSWER, DEVLOPMENTCHAINS } = require("../config-constans")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    console.log("this is a deploy func")

    if (DEVLOPMENTCHAINS.includes(network.name)) {
        await deploy("MockV3Aggregator", {
            from: account1,
            args: [DECIMAL, INITIAL_ANSWER],
            log: true,
        })
    } else {
        console.log("now is :", network.name)
    }
}

module.exports.tags = ["all", "mock"]