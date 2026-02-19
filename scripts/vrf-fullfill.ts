import { network } from "hardhat";
import { decodeEventLog } from "viem";
import { env } from "../config/index.js";
import { decodeErrorResult } from "viem";

const requestId = BigInt(4);
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

try {
  const tx = await vrfCoordinator.write.fulfillRandomWords([
    requestId,
    customerAddress as `0x${string}`,
  ]);
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: tx,
  });
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  console.log("Transaction receipt:", receipt);
} catch (e) {
    console.log(e);
  const decodedError = decodeErrorResult({
    abi: vrfCoordinator.abi,
    data: (e as any).data,
  });
  console.error("Decoded error:", decodedError);
}
