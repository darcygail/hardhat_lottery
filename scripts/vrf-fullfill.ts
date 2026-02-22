import { network } from "hardhat";
import { decodeEventLog } from "viem";
import { env } from "../config/index.js";
import { decodeErrorResult } from "viem";

const customerAddress = env.customerAddress ?? "";
if (!customerAddress) {
  throw new Error("Missing env: CUSTOMER_ADDRESS");
}
const vrfCoordinatorAddress = env.vrfCoordinator ?? "";
if (!vrfCoordinatorAddress) {
  throw new Error("Missing env: VRF_COORDINATOR");
}

const { viem } = await network.connect({
  network: "localhost",
});

const publicClient = await viem.getPublicClient();

const vrfCoordinator = await viem.getContractAt(
  "VRFCoordinator",
  vrfCoordinatorAddress as `0x${string}`,
);
// listen for RandomWordsRequested events
vrfCoordinator.watchEvent.RandomWordsRequested({}, {
  onLogs: (logs) => {
    logs.forEach(async (log) => {
      const decodedLog = decodeEventLog({
        abi: vrfCoordinator.abi,
        data: log.data,
        topics: log.topics,
      });

      const requestId = decodedLog.args.requestId;
      console.log("RandomWordsRequested event received. Request ID:", requestId.toString());
      
      // fulfill the random words request
      await fulfillRandomWords(requestId);
    });
  }
})



async function fulfillRandomWords(requestId: bigint) {
  try {
    console.log("Fulfilling random words for request ID:", requestId.toString());
    // fulfill the random words request
    const tx = await vrfCoordinator.write.fulfillRandomWords([
      requestId,
      customerAddress as `0x${string}`,
    ]);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });
    console.log("Transaction confirmed in block:", receipt.blockNumber);
  } catch (e) {
    console.log(e);
    const decodedError = decodeErrorResult({
      abi: vrfCoordinator.abi,
      data: (e as any).data,
    });
    console.error("Decoded error:", decodedError);
  }
}
