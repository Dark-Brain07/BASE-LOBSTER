// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title BaseLobsterToken
 * @dev ERC20 Governance Token for BASE LOBSTER ($BLSTR)
 * Features:
 * - Fixed supply of 1,000,000 BLSTR tokens
 * - Voting power through delegation (ERC20Votes)
 * - Permit for gasless approvals (ERC20Permit)
 * - No minting after initial deployment
 * 
 * This token is halal-compliant: no gambling, no speculation mechanics.
 * Used purely for community governance on Base blockchain.
 */
contract BaseLobsterToken is ERC20, ERC20Permit, ERC20Votes {
    /// @notice Total supply: 1,000,000 tokens with 18 decimals
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;

    /// @notice Token distribution percentages
    uint256 public constant TREASURY_ALLOCATION = 50; // 50% to treasury
    uint256 public constant COMMUNITY_ALLOCATION = 30; // 30% for community claims
    uint256 public constant TEAM_ALLOCATION = 20; // 20% for team

    /// @notice Addresses for initial distribution
    address public immutable treasuryAddress;
    address public immutable communityClaimAddress;
    address public immutable teamAddress;

    /// @notice Deployment timestamp for transparency
    uint256 public immutable deployedAt;

    /// @notice Events for transparency
    event TokensDistributed(
        address indexed treasury,
        uint256 treasuryAmount,
        address indexed community,
        uint256 communityAmount,
        address indexed team,
        uint256 teamAmount
    );

    /**
     * @dev Constructor mints the entire supply and distributes it
     * @param _treasury Address of the treasury contract
     * @param _communityClaimAddress Address for community token claims
     * @param _teamAddress Address for team allocation
     */
    constructor(
        address _treasury,
        address _communityClaimAddress,
        address _teamAddress
    ) ERC20("BASE LOBSTER", "BLSTR") ERC20Permit("BASE LOBSTER") {
        require(_treasury != address(0), "Treasury address cannot be zero");
        require(_communityClaimAddress != address(0), "Community address cannot be zero");
        require(_teamAddress != address(0), "Team address cannot be zero");

        treasuryAddress = _treasury;
        communityClaimAddress = _communityClaimAddress;
        teamAddress = _teamAddress;
        deployedAt = block.timestamp;

        // Calculate distribution amounts
        uint256 treasuryAmount = (MAX_SUPPLY * TREASURY_ALLOCATION) / 100;
        uint256 communityAmount = (MAX_SUPPLY * COMMUNITY_ALLOCATION) / 100;
        uint256 teamAmount = (MAX_SUPPLY * TEAM_ALLOCATION) / 100;

        // Mint and distribute tokens
        _mint(_treasury, treasuryAmount);
        _mint(_communityClaimAddress, communityAmount);
        _mint(_teamAddress, teamAmount);

        emit TokensDistributed(
            _treasury,
            treasuryAmount,
            _communityClaimAddress,
            communityAmount,
            _teamAddress,
            teamAmount
        );
    }

    /**
     * @dev Returns the current timestamp as the clock value (block.timestamp)
     * Required by ERC20Votes for snapshot functionality
     */
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    /**
     * @dev Returns the clock mode description
     * Required by ERC20Votes
     */
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }

    // ============ Required Overrides ============

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
