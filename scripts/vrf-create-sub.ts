import { network } from "hardhat";
import { decodeEventLog } from "viem";
import {env} from "../config/index.js";
const vrfCoordinatorAddress = env.vrfCoordinator ?? "";
if (!vrfCoordinatorAddress) {
  throw new Error("Missing env: VRF_COORDINATOR");
}

const { viem } = await network.connect({
  network: "localhost",
});
const publicClient = await viem.getPublicClient();
const walletClients = await viem.getWalletClients();
const walletClient = walletClients[0]; // 使用第一个钱包客户端

const vrfCoordinator = await viem.getContractAt(
  "VRFCoordinator",
  vrfCoordinatorAddress as `0x${string}`,
);
const subscriptionTx = await vrfCoordinator.write.createSubscription({});
console.log(subscriptionTx);
const receipt = await publicClient.waitForTransactionReceipt({
  hash: subscriptionTx,
});
console.log("Transaction confirmed in block:", receipt.blockNumber);
console.log("Transaction receipt:", receipt);

// 5️⃣ 解析 SubscriptionCreated 事件
let subscriptionCreatedEvent: { subId: bigint; owner: string } | undefined;

for (const log of receipt.logs) {
  try {
    const decoded = decodeEventLog({
      abi: vrfCoordinator.abi,
      data: log.data,
      topics: log.topics,
    });

    console.log("Decoded event:", decoded);
    if (decoded && decoded.eventName === "SubscriptionCreated") {
      subscriptionCreatedEvent = {
        subId: decoded.args.subId as bigint,
        owner: decoded.args.owner as string,
      };
      break; // 找到第一个事件即可
    }
  } catch (e) {
    // 非合约事件可以忽略
    continue;
  }
}

if (!subscriptionCreatedEvent) {
  throw new Error("SubscriptionCreated event not found!");
}

console.log("SubscriptionCreated event:", subscriptionCreatedEvent);
console.log(
  "Created subscription id:",
  subscriptionCreatedEvent.subId.toString(),
);

const subId = subscriptionCreatedEvent.subId.toString();
const tx2 = await vrfCoordinator.write.fundSubscription([BigInt(subId), 200000000000000000000n]);
console.log("Fund subscription transaction hash:", tx2);
await publicClient.waitForTransactionReceipt({
  hash: tx2,
});
console.log("Subscription funded successfully!");