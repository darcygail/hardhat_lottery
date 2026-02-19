import { network } from "hardhat";
import { env } from "../config/index.js";

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
const player1 = walletClients[1]; // 使用第一个钱包客户端
const player2 = walletClients[2]; // 使用第二个钱包客户端


const lottery = await viem.getContractAt(
  "Lottery",
  lotteryAddress as `0x${string}`,
);
const winner = await lottery.read.getRecentWinner();
console.log("Current winner:", winner);

const winnerBalance = await publicClient.getBalance({
  address: winner,
});
console.log("Winner balance:", Number(winnerBalance)/10**18, "ETH");