import { network } from "hardhat";
import { env } from "../config/index.js";
import { decodeEventLog } from "viem";

const playerValue = 5 * 10 ** 18; // 5 ether in wei
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
await walletClients[0].sendTransaction({
  account:walletClients[0].account,
  to: "0x56e220b2F331130f515c39ddF6AA910986804b89" as `0x${string}`,
  value: BigInt(playerValue),
});
console.log("Entered the lottery with 5 ether");