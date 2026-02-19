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

const tx = await lottery.write.requestRandomWords([false], {
  account: owner.account,
});
const txReceipt = await publicClient.waitForTransactionReceipt({ hash: tx });
console.log("Random words requested in block:", txReceipt.blockNumber);

console.log(txReceipt);
for (const log of txReceipt.logs) {
  try {
    const decoded = decodeEventLog({
      abi: lottery.abi,
      data: log.data,
      topics: log.topics,
    });

    console.log("Decoded event:", decoded);
  } catch (e) {
    // 非合约事件可以忽略
    continue;
  }
}
