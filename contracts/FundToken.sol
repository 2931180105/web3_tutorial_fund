// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {FundMe} from "./FundMe.sol";

/*
Fundme
1.让FundMe的参与者，基于mapping来领取相应数量的通证
2.让FundMe的用户可以对代币进行转账
2.使用完成后，这个代币需要burn
*/ 

contract FundToken is ERC20 {
    FundMe fundMe;

    constructor(address addr) ERC20("FundTOken","FT") {
        fundMe = FundMe(addr);
    }

    // 获取代币
    function mint(uint256 number) public {
        require(fundMe.funderAmountMap(msg.sender) >= number,"You buys not ehough.");
        require(fundMe.getIsCashout(),"the fundme not success");
       _mint(msg.sender,number);
       fundMe.setFunderToAmount(msg.sender,fundMe.funderAmountMap(msg.sender) - number);
    }
    
    function claim(uint256 amountToClaim) public {
        require(balanceOf(msg.sender) >= amountToClaim,"you banlance is not enough");
        _burn(msg.sender,amountToClaim);
    }

}