// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title BaseLobsterTreasury
 * @dev Treasury contract for BASE LOBSTER community funds
 * Features:
 * - Holds community ETH funds
 * - Only executable through governance proposals
 * - Transparent fund tracking with events
 * - Donation functionality for community contributions
 * - Withdrawal only through passed governance proposals
 * 
 * Inherits from TimelockController for governance integration
 */
contract BaseLobsterTreasury is TimelockController {
    /// @notice Events for fund tracking
    event DonationReceived(address indexed donor, uint256 amount, string message);
    event FundsAllocated(address indexed recipient, uint256 amount, string purpose);
    event EmergencyWithdrawal(address indexed recipient, uint256 amount);

    /// @notice Donation record structure
    struct Donation {
        address donor;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    /// @notice Array of all donations for transparency
    Donation[] public donations;

    /// @notice Total donations received
    uint256 public totalDonationsReceived;

    /// @notice Total funds allocated through governance
    uint256 public totalFundsAllocated;

    /// @notice Allocation record structure
    struct Allocation {
        address recipient;
        uint256 amount;
        string purpose;
        uint256 timestamp;
        uint256 proposalId;
    }

    /// @notice Array of all allocations for transparency
    Allocation[] public allocations;

    /**
     * @dev Constructor sets up the timelock with governance controls
     * @param minDelay Minimum delay for execution (1 day = 86400 seconds)
     * @param proposers Addresses that can propose (Governor contract)
     * @param executors Addresses that can execute (Governor contract or zero address for anyone)
     * @param admin Initial admin address (will be renounced after setup)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}

    /**
     * @dev Donate ETH to the treasury
     * @param message Optional message from the donor
     */
    function donate(string calldata message) external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        
        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            message: message,
            timestamp: block.timestamp
        }));
        
        totalDonationsReceived += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, message);
    }

    /**
     * @dev Allocate funds to a recipient (only through governance)
     * @param recipient Address to receive funds
     * @param amount Amount of ETH to send
     * @param purpose Description of the allocation
     * @param proposalId ID of the governance proposal authorizing this
     */
    function allocateFunds(
        address payable recipient,
        uint256 amount,
        string calldata purpose,
        uint256 proposalId
    ) external onlyRole(EXECUTOR_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient treasury balance");
        
        allocations.push(Allocation({
            recipient: recipient,
            amount: amount,
            purpose: purpose,
            timestamp: block.timestamp,
            proposalId: proposalId
        }));
        
        totalFundsAllocated += amount;
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsAllocated(recipient, amount, purpose);
    }

    /**
     * @dev Get the current treasury balance
     */
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get the count of donations
     */
    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }

    /**
     * @dev Get donation by index
     * @param index Index in the donations array
     */
    function getDonation(uint256 index) external view returns (
        address donor,
        uint256 amount,
        string memory message,
        uint256 timestamp
    ) {
        require(index < donations.length, "Index out of bounds");
        Donation storage d = donations[index];
        return (d.donor, d.amount, d.message, d.timestamp);
    }

    /**
     * @dev Get the count of allocations
     */
    function getAllocationCount() external view returns (uint256) {
        return allocations.length;
    }

    /**
     * @dev Get allocation by index
     * @param index Index in the allocations array
     */
    function getAllocation(uint256 index) external view returns (
        address recipient,
        uint256 amount,
        string memory purpose,
        uint256 timestamp,
        uint256 proposalId
    ) {
        require(index < allocations.length, "Index out of bounds");
        Allocation storage a = allocations[index];
        return (a.recipient, a.amount, a.purpose, a.timestamp, a.proposalId);
    }

    /**
     * @dev Get treasury statistics
     */
    function getTreasuryStats() external view returns (
        uint256 balance,
        uint256 totalReceived,
        uint256 totalAllocated,
        uint256 donationCount,
        uint256 allocationCount
    ) {
        return (
            address(this).balance,
            totalDonationsReceived,
            totalFundsAllocated,
            donations.length,
            allocations.length
        );
    }

    /**
     * @dev Receive ETH directly (counts as anonymous donation)
     */
    receive() external payable override {
        if (msg.value > 0) {
            donations.push(Donation({
                donor: msg.sender,
                amount: msg.value,
                message: "Direct ETH transfer",
                timestamp: block.timestamp
            }));
            totalDonationsReceived += msg.value;
            emit DonationReceived(msg.sender, msg.value, "Direct ETH transfer");
        }
    }
}
