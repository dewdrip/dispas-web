// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title DataTypes Library
 * @author
 * @notice Defines common data structures used in the Dispas contract.
 * @dev This library is used to standardize data structures across the contract.
 */
library DataTypes {
    /**
     * @notice Represents a payment entry in the distribution process.
     * @dev Used in the `distributeFunds` function to store recipient details.
     * @param recipient The address receiving the payment.
     * @param amount The amount of LYX to be sent.
     */
    struct Payment {
        address recipient;
        uint256 amount;
    }
}
