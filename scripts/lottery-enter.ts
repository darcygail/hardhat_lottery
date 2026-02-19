import { network } from "hardhat";
import {env} from "../config/index.js";

const playerValue = 5*10**18; // 1 ether in wei
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

console.log("Player 1 entering the lottery...");
const tx1 = await lottery.write.enter({
    value: BigInt(playerValue),
    account: player1.account,

})
const tx1Receipt = await publicClient.waitForTransactionReceipt({ hash: tx1 });
console.log("Player 1 entered the lottery in block:", tx1Receipt.blockNumber);

console.log("Player 2 entering the lottery...");
const tx2 = await lottery.write.enter({
    value: BigInt(playerValue),
    account: player2.account,
})
const tx2Receipt = await publicClient.waitForTransactionReceipt({ hash: tx2 });
console.log("Player 2 entered the lottery in block:", tx2Receipt.blockNumber);

console.log("Both players have entered the lottery.");
const lotteryBalance = await publicClient.getBalance({ address: lotteryAddress as `0x${string}` });
console.log("Lottery contract balance:", Number(lotteryBalance) / 10**18, "ether");
const players = await lottery.read.getPlayers();
console.log("Current players in the lottery:", players);