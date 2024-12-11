// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    mapping (address => uint256) public funderAmountMap;
    uint constant MIN_FUND_VALUE_USDT = 1e18; // 最小值为1
    uint constant TARGET_USDT = 1 * 1e18; // 1000 美元
    bool isCashout = false; // 表示是否提现
    AggregatorV3Interface internal dataFeed;
    address owner;
    uint256 deploymentTimestamp;
    uint256 lockTime = 3*24*60; // 锁定时间 秒 默认3天
    address erc20Addr;

    constructor(uint256 _lockTime) {
        // sepolia test
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
         owner = msg.sender;
         deploymentTimestamp = block.timestamp;// 当前区块的部署时间
        lockTime = _lockTime;
    }


    // 接受用户的众筹
    function fund() external payable {
        require(convertEthToUsdt(msg.value)>= MIN_FUND_VALUE_USDT,"need send more ETH.");
        require(deploymentTimestamp + lockTime < block.timestamp,"project is close.");

       funderAmountMap[msg.sender] += msg.value;
    }

    // 获取eth美元的价格
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }
    
    // 将eth转换为美元的单位
    function convertEthToUsdt(uint256 ethAmount) internal view returns (uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        // eth to usdt 单位是8位
        return ethAmount * ethPrice/1e8;
    }

    // 转移合约所有权
    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
    

    // 当充值的数额大于制定数量，可以提现
    function getFund() external windowClose onlyOwner {
        require(convertEthToUsdt(address(this).balance) >= TARGET_USDT,"target is smart,not cashout."); 
        // 进行转账
        payable(msg.sender).transfer(address(this).balance);
       // bool success = payable(msg.sender).send(address(this).balance);
    //    (bool success,)=payable(msg.sender).call{value:address(this).balance}{""};
        isCashout = true; 
    }

    // 当众筹结束之后且金额没有达到指定值可以进行退回操作
    function refund() external windowClose {
        require(isCashout == false, "project is enable.");
        require(convertEthToUsdt(address(this).balance) < TARGET_USDT,"target is ok,not cashout."); 
        uint256 amount = funderAmountMap[msg.sender];
        require(amount != 0,"no recharge.");
        payable(msg.sender).transfer(amount);
        funderAmountMap[msg.sender] = 0;
    }

    function setFunderToAmount(address addr,uint256 amount) external tokenCall{
        funderAmountMap[addr] = amount;
    }

    // 设置代币合约地址
    function setErc20Addr(address addr) public  onlyOwner {
        erc20Addr = addr;
    }

    function getIsCashout() external tokenCall view  returns (bool){
        return isCashout;
    }

    modifier tokenCall() {
        require(msg.sender == erc20Addr,"error is not erc20.");
        _;
    }

    modifier windowClose() {
        require(deploymentTimestamp + lockTime >= block.timestamp,"windows not closed.");
        _; // 被限制的函数代码存在的地方
    }
    modifier onlyOwner(){
        require(msg.sender == owner,"not owner.");
        _;
    }
}