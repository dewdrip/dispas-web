// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import { IDispas } from "../interfaces/IDispas.sol";
import { DataTypes } from "./libraries/DataTypes.sol";
import { ILSP7DigitalAsset } from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/ILSP7DigitalAsset.sol";

/**
 * @title Dispas - A Gas-Efficient LYX and LSP7 Token Distributor
 * @author Valentine Orga
 * @notice This contract allows users to split LYX and LSP7 token payments among multiple recipients.
 * @dev Uses a single loop for efficiency, calldata structs to minimize gas, and robust error handling.
 */
contract Dispas is IDispas {
    // ==========================
    // Errors
    // ==========================
    error Dispas__ZeroAddress();
    error Dispas__ZeroAmount();
    error Dispas__InsufficientValue();
    error Dispas__TransferFailed(address recipient, uint256 amount);
    error Dispas__InsufficientAllowance();
    error Dispas__TokenTransferFailed(address recipient, uint256 amount);

    // ==========================
    // Functions
    // ==========================

    /// @inheritdoc IDispas
    function distributeFunds(DataTypes.Payment[] calldata payments) external payable {
        uint256 distributedAmount = 0;
        uint256 paymentsLength = payments.length;

        for (uint256 i = 0; i < paymentsLength; i++) {
            DataTypes.Payment calldata payment = payments[i];

            // validate input
            require(payment.recipient != address(0), Dispas__ZeroAddress());
            require(payment.amount != 0, Dispas__ZeroAmount());

            // track total distribution
            distributedAmount += payment.amount;

            // ensure distributed amount does not exceed the full msg.value
            if (distributedAmount > msg.value) revert Dispas__InsufficientValue();

            // attempt transfer
            (bool success, ) = payment.recipient.call{ value: payment.amount }("");
            require(success, Dispas__TransferFailed(payment.recipient, payment.amount));
        }

        // emit event for overall distribution
        emit FundsDistributed(msg.sender, msg.value);
    }

    /// @inheritdoc IDispas
    function distributeTokens(address tokenAddress, DataTypes.Payment[] calldata payments) external {
        ILSP7DigitalAsset token = ILSP7DigitalAsset(tokenAddress);
        uint256 totalAmount = 0;
        uint256 paymentsLength = payments.length;

        // Calculate total amount to transfer
        for (uint256 i = 0; i < paymentsLength; i++) {
            DataTypes.Payment calldata payment = payments[i];
            require(payment.recipient != address(0), Dispas__ZeroAddress());
            require(payment.amount != 0, Dispas__ZeroAmount());
            totalAmount += payment.amount;
        }

        // Check allowance
        uint256 allowance = token.authorizedAmountFor(msg.sender, address(this));
        if (allowance < totalAmount) revert Dispas__InsufficientAllowance();

        // Transfer tokens
        for (uint256 i = 0; i < paymentsLength; i++) {
            DataTypes.Payment calldata payment = payments[i];
            try token.transfer(msg.sender, payment.recipient, payment.amount, true, "") {
                // Transfer successful
            } catch {
                revert Dispas__TokenTransferFailed(payment.recipient, payment.amount);
            }
        }

        emit TokensDistributed(msg.sender, tokenAddress, totalAmount);
    }
}
