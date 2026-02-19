import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import {env,envkey,upsertEnvVar} from "../../config/index.js";

const LotteryModule = buildModule("LotteryModule", (m) => {
  const vrfCoordinator = env.vrfCoordinator ?? "";
  const subscriptionId = env.subscriptionId ?? "";
  const entryFee = env.entryFee;
  const keyHash =env.keyHash;
  const callbackGasLimit = Number(env.callbackGasLimit);
  const requestConfirmations = Number(env.requestConfirmations ?? "");

  if (!vrfCoordinator) {
    throw new Error("Missing env: VRF_COORDINATOR");
  }
  if (!subscriptionId) {
    throw new Error("Missing env: SUBSCRIPTION_ID");
  }

  const lottery = m.contract("Lottery", [
    subscriptionId,
    vrfCoordinator,
    entryFee,
    keyHash,
    callbackGasLimit,
    requestConfirmations,
  ]);

  return { lottery };
});

export default LotteryModule;
