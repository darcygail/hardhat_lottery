// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {Lottery} from "./Lottery.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

interface IVRFConsumerLike {
    function rawFulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) external;
}

contract VRFCoordinatorV2PlusMock {
    uint256 public lastRequestId;

    function requestRandomWords(
        VRFV2PlusClient.RandomWordsRequest calldata
    ) external returns (uint256) {
        lastRequestId++;
        return lastRequestId;
    }

    function fulfill(
        address consumer,
        uint256 requestId,
        uint256[] calldata randomWords
    ) external {
        IVRFConsumerLike(consumer).rawFulfillRandomWords(requestId, randomWords);
    }
}

contract LotteryTest is Test {
    Lottery private s_lottery;
    VRFCoordinatorV2PlusMock private s_coordinator;

    address private s_alice = address(0xA11CE);
    address private s_bob = address(0xB0B);
    address private s_carol = address(0xCAA0A);

    uint256 private constant ENTRY_FEE = 0.1 ether;
    bytes32 private constant KEY_HASH = bytes32("keyhash");
    uint32 private constant CALLBACK_GAS_LIMIT = 500_000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    function setUp() external {
        s_coordinator = new VRFCoordinatorV2PlusMock();
        s_lottery = new Lottery(
            address(s_coordinator),
            ENTRY_FEE,
            KEY_HASH,
            CALLBACK_GAS_LIMIT,
            REQUEST_CONFIRMATIONS,
            60*60*1
        );
    }

    function testEnterRevertsIfNotEnough() external {
        vm.expectRevert(Lottery.Lottery__NotEnoughEntryFee.selector);
        s_lottery.enter{value: ENTRY_FEE - 1}();
    }

    function testEnterAddsPlayer() external {
        vm.deal(s_alice, 1 ether);
        vm.prank(s_alice);
        s_lottery.enter{value: ENTRY_FEE}();

        address[] memory players = s_lottery.getPlayers();
        assertEq(players.length, 1);
        assertEq(players[0], s_alice);
    }

    function testRequestRandomWordsSetsStatus() external {
        s_lottery.requestRandomWords(false);
        assertEq(uint256(s_lottery.getRaffleStatus()), uint256(Lottery.RaffleStatus.CALCULATING));
    }

    function testFulfillRandomWordsPicksWinnerAndResets() external {
        vm.deal(s_alice, 1 ether);
        vm.deal(s_bob, 1 ether);
        vm.deal(s_carol, 1 ether);

        vm.prank(s_alice);
        s_lottery.enter{value: ENTRY_FEE}();
        vm.prank(s_bob);
        s_lottery.enter{value: ENTRY_FEE}();
        vm.prank(s_carol);
        s_lottery.enter{value: ENTRY_FEE}();

        uint256 pot = ENTRY_FEE * 3;

        uint256[] memory words = new uint256[](1);
        words[0] = 1; // winnerIndex = 1

        uint256 bobBalanceBefore = s_bob.balance;
        s_coordinator.fulfill(address(s_lottery), 1, words);

        assertEq(s_lottery.getRecentWinner(), s_bob);
        assertEq(s_lottery.getPlayers().length, 0);
        assertEq(uint256(s_lottery.getRaffleStatus()), uint256(Lottery.RaffleStatus.OPEN));
        assertEq(s_bob.balance, bobBalanceBefore + pot);
    }
}