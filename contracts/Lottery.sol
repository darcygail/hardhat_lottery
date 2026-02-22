// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatible} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract Lottery is VRFConsumerBaseV2Plus, AutomationCompatible {
    /* Errors */
    error Lottery__NotEnoughEntryFee();
    error Lottery__TransferFailed();
    error Lottery__CurrRoundLocked();
    error Lottery__NotNeedToDraw();

    /* Type declarations */
    enum RaffleStatus {
        INIT,
        OPEN,
        CALCULATING
    }

    /* State Variables */
    // Immutable variables
    address private immutable i_manager;
    uint256 private immutable i_entryFee;
    uint16 private immutable i_requestConfirmations;
    uint32 private immutable i_callbackGasLimit;
    bytes32 private immutable i_keyHash;
    uint256 private immutable i_interval;

    // Storage variables
    uint256 private s_subscriptionId;
    address[] private s_players;
    address private s_recentWinner;
    RaffleStatus private s_status;
    uint256 private s_lastTimeStamp;

    // Constants
    uint32 private constant NUM_WORDS = 1;

    /* Events */
    event WinnerPicked(address indexed winner);
    event RaffleWinnerRequested(uint256 indexed requestId);
    event PlayerEntered(address indexed player);

    /* Functions */
    constructor(
        address vrfCoordinator,
        uint256 entryFee,
        bytes32 keyHash,
        uint32 callbackGasLimit,
        uint16 requestConfirmations,
        uint256 interval
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_manager = msg.sender;
        i_entryFee = entryFee;
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
        i_requestConfirmations = requestConfirmations;
        i_interval = interval;
        s_status = RaffleStatus.INIT;
        s_lastTimeStamp = block.timestamp;
    }

    /* External Functions */
    function enter() external payable {
        if (msg.value < i_entryFee) {
            revert Lottery__NotEnoughEntryFee();
        }

        if (s_status != RaffleStatus.OPEN) {
            revert Lottery__CurrRoundLocked();
        }

        s_players.push(msg.sender);
        emit PlayerEntered(msg.sender);
    }

    function requestRandomWords(
        bool enableNativePayment
    ) external onlyOwner returns (uint256 requestId) {
        return _requestRandomWords(enableNativePayment);
    }

    function _requestRandomWords(
        bool enableNativePayment
    ) internal returns (uint256 requestId) {
        s_status = RaffleStatus.CALCULATING;

        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: i_requestConfirmations,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: enableNativePayment
                    })
                )
            })
        );

        emit RaffleWinnerRequested(requestId);
    }

    function checkUpkeep(
        bytes calldata
    ) external view override returns (bool, bytes memory) {
        bytes memory performData = "0x";
        if (s_status != RaffleStatus.OPEN) {
            return (false, performData);
        }
        if (s_players.length == 0 || address(this).balance == 0) {
            return (false, performData);
        }
        if (block.timestamp - s_lastTimeStamp < i_interval) {
            return (false, performData);
        }

        return (true, performData);
    }

    function performUpkeep(bytes calldata performData) external override {
        (bool upkeepNeeded, ) = this.checkUpkeep(performData);
        if (!upkeepNeeded) {
            revert Lottery__NotNeedToDraw();
        }
        _requestRandomWords(false);
    }

    /* Internal Functions */
    function fulfillRandomWords(
        uint256,
        uint256[] calldata randomWords
    ) internal override {
        uint256 winnerIndex = randomWords[0] % s_players.length;
        address recentWinner = s_players[winnerIndex];

        s_players = new address[](0);
        s_recentWinner = recentWinner;
        s_status = RaffleStatus.OPEN;
        s_lastTimeStamp = block.timestamp;

        (bool success, ) = payable(recentWinner).call{
            value: address(this).balance
        }("");

        if (!success) {
            revert Lottery__TransferFailed();
        }

        emit WinnerPicked(recentWinner);
    }

    /* View / Pure Functions */
    function getPlayers() external view returns (address[] memory) {
        return s_players;
    }

    function getRecentWinner() external view returns (address) {
        return s_recentWinner;
    }

    function getRaffleStatus() external view returns (RaffleStatus) {
        return s_status;
    }

    function getEntryFee() external view returns (uint256) {
        return i_entryFee;
    }

    function getManager() external view returns (address) {
        return i_manager;
    }

    function getJackpot() external view returns (uint256) {
        return address(this).balance;
    }

    function setSubscriptionId(uint256 subscriptionId) external onlyOwner {
        s_subscriptionId = subscriptionId;
        if (s_status == RaffleStatus.INIT) {
            s_status = RaffleStatus.OPEN;
        }
    }
}
