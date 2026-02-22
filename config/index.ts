import * as dotenv from "dotenv";
import { readFileSync, writeFileSync, existsSync } from "fs";
import hat from "hardhat";
const networkName = hat.globalOptions.network;
if (!networkName) {
  throw new Error(
    "Network name is required. Use --network <network-name> to specify the network.",
  );
}
const pathName = `.env.${networkName}`;
console.log("Loading environment variables from:", pathName);
dotenv.config({ path: pathName });

export const env = {
  // LotteryModule
  entryFee: process.env.ENTRY_FEE ?? "",
  lotteryAddress: process.env.LOTTERY_ADDRESS ?? "",

  // VRFCoordinator Parameters
  vrfCoordinator: process.env.VRF_COORDINATOR ?? "",
  subscriptionId: process.env.SUBSCRIPTION_ID ?? "",
  keyHash: process.env.KEY_HASH ?? "",
  callbackGasLimit: Number(process.env.CALLBACK_GAS_LIMIT ?? ""),
  requestConfirmations: Number(process.env.REQUEST_CONFIRMATIONS ?? ""),

  // VRFCoordinatorModule
  baseFee: process.env.BASE_FEE ?? "",
  gasPriceLink: process.env.GAS_PRICE_LINK ?? "",
  weiPerUnitLink: process.env.WEI_PER_UNIT_LINK ?? "",
  customerAddress: process.env.LOTTERY_ADDRESS ?? "",
  interval: Number(process.env.INTERVAL ?? ""),
};
  