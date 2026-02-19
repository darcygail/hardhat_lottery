import { network } from "hardhat";
import { env } from "../config/index.js";
import { decodeEventLog } from "viem";

const playerValue = 5 * 10 ** 18; // 1 ether in wei
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

const lotteryBalance = await publicClient.getBalance({ address: lotteryAddress as `0x${string}` });
console.log("Lottery contract balance:", Number(lotteryBalance) / 10 ** 18, "ether");