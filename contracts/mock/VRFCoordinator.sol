// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract VRFCoordinator is VRFCoordinatorV2_5Mock {
    constructor(
        uint96 _baseFee,
        uint96 _gasPrice,
        int256 _weiPerUnitLink
    ) VRFCoordinatorV2_5Mock(_baseFee, _gasPrice, _weiPerUnitLink) {}
    function getTest() external pure returns (string memory) {
        return "Hello, VRFCoordinator!";
    }


    function getRequest(uint256 requestId) public view returns (Request memory) {
         Request memory request = s_requests[requestId];
        return request;
    }
}
