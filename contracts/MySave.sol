// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IERC20.sol";

error ADDRESS_ZERO_DETECTED();
error ZERO_VALUE_NOT_ALLOWED();
error INSUFFICIENT_BALANCE();
error TRANSFER_FROM_FAILED();
error TRANSFER_FAILED();
error ONLY_OWNER_ALLOWED();

contract MySave {
    address token;
    address owner;

    mapping(address => uint256) tokenSavings;
    mapping(address => uint256) etherSavings;

    event SavingSuccessful(address indexed sender, uint256 amount);
    event WithdrawSuccessful(address indexed receiver, uint256 amount);

    constructor(address _savingToken) {
        token = _savingToken;
        owner = msg.sender;
    }

    function depositEther() external payable {
        if (msg.sender == address(0)) {
            revert ADDRESS_ZERO_DETECTED();
        }
        if (msg.value <= 0) {
            revert ZERO_VALUE_NOT_ALLOWED();
        }
        etherSavings[msg.sender] = etherSavings[msg.sender] + msg.value;

        emit SavingSuccessful(msg.sender, msg.value);
    }

    function depositToken(uint256 _amount) external {
        if (msg.sender == address(0)) {
            revert ADDRESS_ZERO_DETECTED();
        }

        if (_amount <= 0) {
            revert ZERO_VALUE_NOT_ALLOWED();
        }

        if (IERC20(token).balanceOf(msg.sender) < _amount) {
            revert INSUFFICIENT_BALANCE();
        }

        if (!IERC20(token).transferFrom(msg.sender, address(this), _amount)) {
            revert TRANSFER_FROM_FAILED();
        }

        tokenSavings[msg.sender] += _amount;

        emit SavingSuccessful(msg.sender, _amount);
    }

    function withdrawEther() external {
        //sanity check
        if (msg.sender == address(0)) {
            revert ADDRESS_ZERO_DETECTED();
        }

        //saves gas
        uint256 _userSavings = etherSavings[msg.sender];

        if (_userSavings <= 0) {
            revert ZERO_VALUE_NOT_ALLOWED();
        }

        etherSavings[msg.sender] = etherSavings[msg.sender] - _userSavings;

        payable(msg.sender).transfer(_userSavings);

        emit WithdrawSuccessful(msg.sender, _userSavings);
    }

    function withdrawToken(uint256 _amount) external {
        if (msg.sender == address(0)) {
            revert ADDRESS_ZERO_DETECTED();
        }

        if (_amount <= 0) {
            revert ZERO_VALUE_NOT_ALLOWED();
        }

        uint256 _userSaving = tokenSavings[msg.sender];

        if (_userSaving < _amount) {
            revert INSUFFICIENT_BALANCE();
        }

        tokenSavings[msg.sender] -= _amount;

        if (!IERC20(token).transfer(msg.sender, _amount)) {
            revert TRANSFER_FAILED();
        }

        emit WithdrawSuccessful(msg.sender, _amount);
    }

    function checkContractBalanceForToken() external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function checkContractBalanceForEther() external view returns (uint256) {
        return address(this).balance;
    }

    function checkUserTokenBalance(
        address _user
    ) external view returns (uint256) {
        return tokenSavings[_user];
    }

    function checkUserEtherBalance(
        address _user
    ) external view returns (uint256) {
        return etherSavings[_user];
    }
}
