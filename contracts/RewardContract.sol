// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract RewardContract is AccessControl, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using SafeERC20 for IERC20;

    /**
     * @notice Settings of tokens
     * @return token Address of token
     * @return enabled Is true if enabled, is false if disabled
     * @return naive Is true if native coin, is false if ERC20 token
     */
    struct TokenSettings {
        address token;
        bool enabled;
        bool native;
    }

    /// @notice Eeward Token
    IERC20 public rewardToken;

    /// @notice Admin role constant
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @notice Service role constant(CEX.io)
    bytes32 public constant SERVICE_ROLE = keccak256("SERVICE_ROLE");

    /// @notice Settings of tokens
    mapping(string => TokenSettings) public tokens;

    /// @notice Emitted when reward are paid
    event RewardPaid(address indexed user, uint256 amount);

    /// NOTE: to review
    mapping(address => uint256) public nonces;
    uint256 public nonce_ = 1;

    /**
     * @param _rewardToken Current block timestamp
     * @param _adminRole Initiator of transaction
     * @param _validator Recipient address
     */
    constructor(address _rewardToken, address _adminRole, address _validator) {
        _grantRole(ADMIN_ROLE, _adminRole);
        _grantRole(SERVICE_ROLE, _validator);
        rewardToken = IERC20(_rewardToken);
    }

    /**
     * @dev Execute claim
     * @param nonce Number of transaction
     * @param recipient Recipient address
     * @param amount Amount of tokens
     * @param v V of signature
     * @param r R of signature
     * @param s S of signature
     * @param symbol Symbol of token
     */

    function claimReward(
        uint256 nonce,
        uint256 amount,
        address recipient,
        uint8 v,
        bytes32 r,
        bytes32 s,
        string memory symbol
    ) external whenNotPaused {
        require(
            tokens[symbol].enabled,
            "This token not registered or disabled"
        );

        bytes32 message = keccak256(
            abi.encodePacked(nonce, amount, recipient, symbol)
        );

        require(
            hasRole(
                SERVICE_ROLE,
                message.toEthSignedMessageHash().recover(v, r, s)
            ),
            "Service address is invalid or signature is faked"
        );

        rewardToken.safeTransfer(recipient, amount);
        emit RewardPaid(recipient, amount);
    }

    /// NOTE: to review
    function claimReward2(
        uint256 amount,
        address recipient,
        uint8 v,
        bytes32 r,
        bytes32 s,
        string memory symbol
    ) external whenNotPaused {
        require(
            tokens[symbol].enabled,
            "This token not registered or disabled"
        );

        bytes32 message = keccak256(
            abi.encodePacked(nonce_, amount, recipient, symbol)
        );

        require(
            hasRole(
                SERVICE_ROLE,
                message.toEthSignedMessageHash().recover(v, r, s)
            ),
            "Service address is invalid or signature is faked"
        );

        nonces[recipient] = nonce_;
        nonce_++;

        rewardToken.safeTransfer(recipient, amount);
        emit RewardPaid(recipient, amount);
    }

    /// @notice Update token settings
    function updateRewardToken(
        address token,
        bool enabled,
        bool native,
        string memory symbol
    ) public onlyRole(ADMIN_ROLE) {
        require(
            bytes(symbol).length > 0,
            "Symbol length must be greater than 0"
        );
        tokens[symbol] = TokenSettings({
            token: token,
            enabled: enabled,
            native: native
        });
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
