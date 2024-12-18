const { time } = require("@nomicfoundation/hardhat-network-helpers");

require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('@chainlink/env-enc').config({ password: '123456' });
require("./tasks")
require("hardhat-deploy")
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
// 存放hardhat配置的地方 
/** @type import('hardhat/config').HardhatUserConfig */

const INFURA_SEPOLIA_KEY = process.env.INFURA_SEPOLIA_KEY
const METAMASK_KEY_1 = process.env.METAMASK_KEY_1
const METAMASK_KEY_2 = process.env.METAMASK_KEY_2
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

const config = {
  defaultNetwork: "hardhat",
  solidity: "0.8.24",
  mocha:{
    timeout:2000000
  },
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/" + INFURA_SEPOLIA_KEY,
      accounts: [METAMASK_KEY_1, METAMASK_KEY_2],
      chainId:11155111,
    },
    // accounts:[process.env.PRIVATE_KEY]
    // hardhat: {
    //   mining: {
    //     auto: false,
    //     interval: 5000
    //   },
    //   forking: {
    //     url: "https://sepolia.infura.io/v3/" + INFURA_SEPOLIA_KEY,
    //   }
    // }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  },
  namedAccounts: {
    account1: {
      default: 0
    },
    account2: {
      default: 1
    }
  },
  gasReporter:{
    enabled:true,
  }

};

// npx hardhat node --fork https://sepolia.infura.io/v3/188b040c5e2847c3955a4214e2ae4c28
// 3600 代表构造函数需要的参数
// npx hardhat verify --network hardhat 0x5FbDB2315678afecb367f032d93F642f64180aa3 "3600"
module.exports = config;
// env-enc 密码：123456