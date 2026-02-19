import { network } from "hardhat";
import { env } from "../config/index.js";
const vrfCoordinatorAddress = env.vrfCoordinator;
if (!vrfCoordinatorAddress) {
  throw new Error("Missing env: VRF_COORDINATOR");
}

const { viem } = await network.connect({
  network: "localhost",
  chainType: "l1",
});
const publicClient = await viem.getPublicClient();
const walletClients = await viem.getWalletClients();

const owner = walletClients[0]; // 使用第一个钱包客户端
console.log("Owner address:", owner.account.address);
const balance = await publicClient.getBalance({
  address: owner.account.address,
});
console.log(balance);

const vrfCoordinator = await viem.getContractAt(
  "VRFCoordinator",
  vrfCoordinatorAddress as `0x${string}`,
);
const result = await vrfCoordinator.read.getActiveSubscriptionIds([0, 10]);
console.log("Active subscription IDs:", result);
