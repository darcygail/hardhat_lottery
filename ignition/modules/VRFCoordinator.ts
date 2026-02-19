import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import { env } from "../../config/index.js";
const VRFCoordinatorModule = buildModule("VRFCoordinatorModule", (m) => {
  const baseFee = env.baseFee ?? 0;
  const gasPriceLink = env.gasPriceLink ?? 0;
  const weiPerUnitLink = env.weiPerUnitLink ?? 0;
  if (!baseFee || !gasPriceLink || !weiPerUnitLink) {
    throw new Error("Missing environment variables for VRFCoordinatorModule");
  }
  const vrfCoordinator = m.contract("VRFCoordinator", [
    baseFee,
    gasPriceLink,
    weiPerUnitLink,
  ]);

  return { vrfCoordinator };
});

export default VRFCoordinatorModule;
