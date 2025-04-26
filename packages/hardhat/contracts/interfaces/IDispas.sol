// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import { DataTypes } from "../protocol/libraries/DataTypes.sol";

/**
 * @title IDispas - Interface for LYX Distribution Contract
 * @author Valentine Orga
 * @notice Defines the interface for Dispas, a contract that allows LYX distribution to multiple addresses.
 */
interface IDispas {
    /// @notice Emitted when LYX is successfully distributed to multiple recipients.
    /// @param sender The address that initiated the distribution.
    /// @param totalAmount The total LYX amount distributed.
    event FundsDistributed(address indexed sender, uint256 totalAmount);

    /// @notice Emitted when tokens are successfully distributed to multiple recipients.
    /// @param sender The address that initiated the distribution.
    /// @param tokenAddress The address of the token distributed.
    /// @param totalAmount The total amount of tokens distributed.
    event TokensDistributed(address indexed sender, address indexed tokenAddress, uint256 totalAmount);

    /// @notice Emitted when a single recipient successfully receives LYX.
    /// @param recipient The address that received the payment.
    /// @param amount The amount of LYX sent.
    event PaymentSent(address indexed recipient, uint256 amount);

    /**
     * @notice Distributes LYX to multiple recipients.
     * @dev Requires that each recipient is a valid address and receives a non-zero amount.
     *      The total distributed amount must match `msg.value`.
     * @param payments An array of `Payment` structs containing recipient addresses and corresponding amounts.
     */
    function distributeFunds(DataTypes.Payment[] calldata payments) external payable;

    /**
     * @notice Distributes tokens to multiple recipients.
     * @dev Requires that each recipient is a valid address and receives a non-zero amount.
     *      The total distributed amount must match `msg.value`.
     * @param tokenAddress The address of the token to distribute.
     * @param payments An array of `Payment` structs containing recipient addresses and corresponding amounts.
     */
    function distributeTokens(address tokenAddress, DataTypes.Payment[] calldata payments) external;
}
