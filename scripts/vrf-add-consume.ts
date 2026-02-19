import { network } from "hardhat";
import {env} from "../config/index.js";
const { viem } = await network.connect();

const vrfCoordinatorAddress = env.vrfCoordinator ?? "";
const customerAddress = env.customerAddress ?? "";
const subscriptionId = BigInt(env.subscriptionId ?? "");
if (!vrfCoordinatorAddress) {
  throw new Error("Missing env: VRF_COORDINATOR");
}
const publicClient = await viem.getPublicClient();

const vrfCoordinator = await viem.getContractAt(
  "VRFCoordinator",
  vrfCoordinatorAddress as `0x${string}`,
);
const tx = await vrfCoordinator.write.addConsumer([subscriptionId, customerAddress as `0x${string}`]);
const receipt = await publicClient.waitForTransactionReceipt({
  hash: tx,
});
console.log("Transaction confirmed in block:", receipt.blockNumber);
console.log("Transaction receipt:", receipt);
