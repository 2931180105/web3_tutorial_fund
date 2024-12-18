const DECIMAL = 8 // ether to usdt 
const INITIAL_ANSWER = 3 * 1e11
const DEVLOPMENTCHAINS = ["hardhat","local"]
const LOCK_TIME = 180
const CONFIRMATIONS = 5
const networkConfig = {
    11155111:{
        ethUsdtAddr:"0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    }
} //  map结构

module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    DEVLOPMENTCHAINS,
    networkConfig,
    LOCK_TIME,
    CONFIRMATIONS,
}