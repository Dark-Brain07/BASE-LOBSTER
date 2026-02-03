// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BaseLobsterFaucet
 * @dev A faucet contract that distributes BLSTR tokens with a 24-hour cooldown per wallet
 */
contract BaseLobsterFaucet is Ownable, ReentrancyGuard {
    IERC20 public immutable token;
    
    uint256 public constant CLAIM_AMOUNT = 1 ether; // 1 BLSTR (18 decimals)
    uint256 public constant COOLDOWN_PERIOD = 24 hours;
    
    mapping(address => uint256) public lastClaimTime;
    
    uint256 public totalClaimed;
    uint256 public totalClaimers;
    
    event TokensClaimed(address indexed claimer, uint256 amount, uint256 timestamp);
    event FaucetFunded(address indexed funder, uint256 amount);
    event EmergencyWithdraw(address indexed owner, uint256 amount);
    
    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }
    
    /**
     * @dev Claim tokens from the faucet
     */
    function claim() external nonReentrant {
        require(canClaim(msg.sender), "Cannot claim yet");
        require(getRemainingBalance() >= CLAIM_AMOUNT, "Faucet is empty");
        
        if (lastClaimTime[msg.sender] == 0) {
            totalClaimers++;
        }
        
        lastClaimTime[msg.sender] = block.timestamp;
        totalClaimed += CLAIM_AMOUNT;
        
        require(token.transfer(msg.sender, CLAIM_AMOUNT), "Transfer failed");
        
        emit TokensClaimed(msg.sender, CLAIM_AMOUNT, block.timestamp);
    }
    
    /**
     * @dev Check if an address can claim tokens
     */
    function canClaim(address _address) public view returns (bool) {
        if (lastClaimTime[_address] == 0) return true;
        return block.timestamp >= lastClaimTime[_address] + COOLDOWN_PERIOD;
    }
    
    /**
     * @dev Get the next claim time for an address
     */
    function getNextClaimTime(address _address) external view returns (uint256) {
        if (lastClaimTime[_address] == 0) return 0;
        uint256 nextTime = lastClaimTime[_address] + COOLDOWN_PERIOD;
        if (block.timestamp >= nextTime) return 0;
        return nextTime;
    }
    
    /**
     * @dev Get time remaining until next claim (in seconds)
     */
    function getTimeUntilNextClaim(address _address) external view returns (uint256) {
        if (canClaim(_address)) return 0;
        return (lastClaimTime[_address] + COOLDOWN_PERIOD) - block.timestamp;
    }
    
    /**
     * @dev Get the remaining balance in the faucet
     */
    function getRemainingBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    /**
     * @dev Get faucet statistics
     */
    function getFaucetStats() external view returns (
        uint256 remainingBalance,
        uint256 claimAmount,
        uint256 cooldownPeriod,
        uint256 totalClaimedAmount,
        uint256 totalClaimersCount
    ) {
        return (
            getRemainingBalance(),
            CLAIM_AMOUNT,
            COOLDOWN_PERIOD,
            totalClaimed,
            totalClaimers
        );
    }
    
    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = getRemainingBalance();
        require(balance > 0, "No balance to withdraw");
        require(token.transfer(owner(), balance), "Transfer failed");
        emit EmergencyWithdraw(owner(), balance);
    }
}
