import { network } from "hardhat";
import { env } from "../config/index.js";
import { decodeEventLog } from "viem";

/**
 * 1. create sub
 * 2. update sub
 * 3. add consumer
 * 4. fund sub
 */

const lotteryAddress = env.lotteryAddress ?? "";
if (!lotteryAddress) {
  throw new Error("Missing env: LOTTERY_ADDRESS");
}

const { viem } = await network.connect({
  network: "localhost",
});
const publicClient = await viem.getPublicClient();
const walletClients = await viem.getWalletClients();
const owner = walletClients[0]; // 使用第一个钱包客户端

const lottery = await viem.getContractAt(
  "Lottery",
  lotteryAddress as `0x${string}`,
);

const vrfCoordinatorAddress = env.vrfCoordinator ?? "";
if (!vrfCoordinatorAddress) {
  throw new Error("Missing env: VRF_COORDINATOR");
}

const vrfCoordinator = await viem.getContractAt(
  "VRFCoordinator",
  vrfCoordinatorAddress as `0x${string}`,
);

console.log("Creating subscription...");
const subId = await createSubscription();
console.log("Subscription created with ID:", subId);
console.log("Funding subscription...");
await fundSubscription(subId);
console.log("Adding consumer to subscription...");
await addConsumer(subId, lotteryAddress);
console.log("Consumer added successfully!");
await updateSubscription(subId, owner.account.address);

async function updateSubscription(subId: string, newOwner: string) {
  const tx = await lottery.write.setSubscriptionId([
    BigInt(subId),
  ]);
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: tx,
  });
}

async function addConsumer(subscriptionId: string, customerAddress: string) {
  const tx = await vrfCoordinator.write.addConsumer([
    BigInt(subscriptionId),
    customerAddress as `0x${string}`,
  ]);
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: tx,
  });
}

async function fundSubscription(subId: string) {
  const tx2 = await vrfCoordinator.write.fundSubscription([
    BigInt(subId),
    200000000000000000000n,
  ]);
  console.log("Fund subscription transaction hash:", tx2);
  await publicClient.waitForTransactionReceipt({
    hash: tx2,
  });
  console.log("Subscription funded successfully!");
}

async function createSubscription() {
  const subscriptionTx = await vrfCoordinator.write.createSubscription({});
  console.log(subscriptionTx);
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: subscriptionTx,
  });

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

  console.log(
    "Created subscription id:",
    subscriptionCreatedEvent.subId.toString(),
  );

  const subId = subscriptionCreatedEvent.subId.toString();
  return subId;
}
