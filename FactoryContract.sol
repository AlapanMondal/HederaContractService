// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FactoryContact {
    event ContractCreated(address newContract, uint256 timestamp);

    childContract[] public deployedContracts;

    function createContract(uint256 initialValue) public {
        childContract newContract = new childContract(initialValue);
        deployedContracts.push(newContract);
        emit ContractCreated(address(newContract), block.timestamp);
    }

    function getDeployedContracts() public view returns (childContract[] memory) {
        return deployedContracts;
    }
}

contract childContract {
    uint256 private value;

    constructor(uint256 initialValue) {
        value = initialValue;
    }

    function incrementValue(uint256 amount) public {
        value += amount;
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}
