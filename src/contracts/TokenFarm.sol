pragma solidity ^0.5.0;

import "./SigmaCoin.sol";
import "./BetaToken.sol";

contract TokenFarm {
	string public name = "BetaToken Farm";
	address public owner;
	SigmaCoin public sigmaCoin;
	BetaToken public betaToken;

	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	constructor(BetaToken _betaToken , SigmaCoin _sigmaCoin) public {
		betaToken = _betaToken;
		sigmaCoin = _sigmaCoin;
		owner = msg.sender;
	}

	// 1. Stake tokens
	function stakeTokens(uint _amount) public {

		// require amount greater than 0
		require(_amount > 0, "amount cannot be 0");

		sigmaCoin.transferFrom(msg.sender,address(this), _amount);

		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

		if(!hasStaked[msg.sender]) {
			stakers.push(msg.sender);
		}

		isStaking[msg.sender] = true;
		hasStaked[msg.sender] = true;
	}

	// Unstaking Tokens (Withdraw)
    function unstakeTokens() public {
        // Fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // Require amount greater than 0
        require(balance > 0, "staking balance cannot be 0");

        // Transfer Mock Dai tokens to this contract for staking
    	sigmaCoin.transfer(msg.sender, balance);

        // Reset staking balance
        stakingBalance[msg.sender] = 0;

        // Update staking status
        isStaking[msg.sender] = false;
    }

    function issueTokens() public {
        // Only owner can call this function
        require(msg.sender == owner, "caller must be the owner");

        // Issue tokens to all stakers
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                betaToken.transfer(recipient, balance);
            }
        }
    }
}