import { network } from "hardhat";
import {env} from "../config/index.js";
const { viem } = await network.connect();

const vrfCoordinatorAddress = env.vrfCoordinator ?? "";
const customerAddress = env.customerAddress ?? "";
const subscriptionId = BigInt(env.subscriptionId ?? "");
if (!vrfCoordinatorAddress) {
  throw new Error("Missing env: VRF_COORDINATOR");
}
const accounts = await viem.getWalletClients();
const owner = accounts[0]; // 使用第一个钱包客户端

const tx = await owner.sendTransaction({
  to: vrfCoordinatorAddress as `0x${string}`,
  value: 10n ** 18n, // 1 LINK token in wei
})