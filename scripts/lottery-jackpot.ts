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

const jackpot = await lottery.read.getJackpot();
console.log("Lottery jackpot:", Number(jackpot) / 10 ** 18, "ether");

const status = await lottery.read.getRaffleStatus();
console.log("Lottery status:", status);

const players = await lottery.read.getPlayers();
console.log("Current players:", players);