import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import { env } from "../../config/index.js";
const DeployAllModule = buildModule("DeployAllModule", (m) => {
  const baseFee = env.baseFee ?? 0;
  const gasPriceLink = env.gasPriceLink ?? 0;
  const weiPerUnitLink = env.weiPerUnitLink ?? 0;
  if (!baseFee || !gasPriceLink || !weiPerUnitLink) {
    throw new Error("Missing environment variables for DeployAllModule");
  }
  const vrfCoordinator = m.contract("VRFCoordinator", [
    baseFee,
    gasPriceLink,
    weiPerUnitLink,
  ]);


  const subscriptionId = env.subscriptionId ?? "";
  const entryFee = env.entryFee;
  const keyHash =env.keyHash;
  const callbackGasLimit = Number(env.callbackGasLimit);
  const requestConfirmations = Number(env.requestConfirmations ?? "");
  const interval = Number(env.interval ?? "");
    const lottery = m.contract("Lottery", [
    vrfCoordinator,
    entryFee,
    keyHash,
    callbackGasLimit,
    requestConfirmations,
    interval,
  ]);
  return { vrfCoordinator, lottery };
});

export default DeployAllModule;
