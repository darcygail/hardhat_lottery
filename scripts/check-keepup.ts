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

async function checkUpkeep() {
  try {
    // 模拟时间流逝，触发 upkeep 条件
    await publicClient.request({
      method: "evm_increaseTime" as any,
      params: [10 as any],
    });
    await publicClient.request({
      method: "evm_mine" as any,
    });

    // 检查是否需要 upkeep
    const upkeepNeeded = await lottery.read.checkUpkeep(["0x"]);
    console.log("Upkeep needed:", upkeepNeeded);
    if (upkeepNeeded[0]) {
      console.log("Performing upkeep...");
      const tx = await lottery.write.performUpkeep(["0x"]);
      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      console.log("Upkeep performed in block:", txReceipt.blockNumber);
    }
  } catch (e) {
    console.error("Error checking or performing upkeep:", e);
  }
}
// 定时检查 upkeep
setInterval(checkUpkeep, 10 * 1000); // 每10秒检查一次
