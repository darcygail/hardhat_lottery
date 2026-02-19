# Hardhat3 Lottery 项目说明

## 一、项目简介

本项目是一个基于 **Hardhat 3** 的去中心化彩票示例，使用 **Chainlink VRF** 提供可验证随机数，主要用于演示：

- 使用 Hardhat 3 + Node.js 原生测试框架（`node:test`）
- 使用 `viem` 与链交互
- 使用 Ignition 模块化部署合约
- 使用不同 `.env.<network>` 文件按网络加载配置

---

## 二、核心功能

- **彩票合约（Lottery）**
  - 用户支付 `entryFee` 参与彩票
  - 调用 Chainlink VRF 请求随机数
  - VRF 回调后选择中奖者并派奖

- **VRFCoordinator Mock 合约**
  - 模拟 Chainlink VRFCoordinator 行为
  - 维护订阅、处理随机数请求与回调
  - 使用 `baseFee`、`gasPriceLink`、`weiPerUnitLink` 等参数配置费用

---

## 三、配置与环境变量

项目使用 `config/index.ts` 按当前 Hardhat 网络自动加载对应 `.env` 文件：

```ts
// filepath: /Users/darcyaf/workdir/web3/hardhat3_lottery/config/index.ts
// ...existing code...
```

运行 Hardhat 时通过 `--network` 指定网络，例如：

```bash
npx hardhat test --network localhost
npx hardhat ignition deploy --network sepolia ...
```

对应会加载：

- `localhost` → `.env.localhost`
- `sepolia`   → `.env.sepolia`
- 其他网络   → `.env.<network>`

环境变量示例（不同网络的值独立）：

- **Lottery 相关**
  - `ENTRY_FEE`：每次参与彩票的费用（单位：wei）
  - `LOTTERY_ADDRESS`：已部署的彩票合约地址

- **VRFCoordinator 参数**
  - `VRF_COORDINATOR`：VRFCoordinator 合约地址
  - `SUBSCRIPTION_ID`：Chainlink VRF 订阅 ID
  - `KEY_HASH`：VRF keyHash
  - `CALLBACK_GAS_LIMIT`：回调函数 gas 限制
  - `REQUEST_CONFIRMATIONS`：随机数请求确认数

- **VRFCoordinator 部署配置**
  - `BASE_FEE`：请求随机数的基础费用
  - `GAS_PRICE_LINK`：链上 gasPrice 与 LINK 价格换算
  - `WEI_PER_UNIT_LINK`：1 LINK 对应的 wei 数

---

## 四、脚本与命令说明

> 下列脚本名以本项目常见约定为例，具体以你仓库中的 `package.json` 为准，请优先查看实际配置。

### 1. `package.json` 中 scripts 一览

| 脚本名 | 作用说明 |
| ------ | -------- |
| `test` | 调用 `npx hardhat test`，运行所有 Solidity 与 TypeScript 集成测试，可配合 `-- --network xxx` 指定网络。 |
| `dev:node` | 调用 `npx hardhat node`，启动本地 Hardhat 网络，便于本地部署与调试。 |
| `vrf-deploy` | 在指定网络部署 VRFCoordinator 合约，控制台输出 VRFCoordinator 合约地址；用于 localhost 测试流程步骤 1。 |
| `vrf-create-sub` | 创建 VRF 订阅并为其充值 LINK，控制台输出 `subscriptionId`；用于 localhost 测试流程步骤 2。 |
| `lottery-deploy` | 部署 Lottery 合约，控制台输出 Lottery 合约地址；用于 localhost 测试流程步骤 3。 |
| `vrf-add-consume` | 将 Lottery 合约地址添加为 VRF 订阅的消费者（consumer）；用于 localhost 测试流程步骤 4。 |
| `lottery-enter` | 调用 Lottery 合约的 `enter` 函数，向当前奖池新增参与者；可多次执行以增加多个玩家；对应 localhost 测试流程步骤 5。 |
| `lottery-draw` | 作为管理员触发开奖逻辑，请求 VRF 随机数（通常调用 `requestRandomWords` 或类似函数）；对应 localhost 测试流程步骤 6。 |
| `vrf-fullfill` | 在本地 / 测试环境中，模拟 Chainlink VRF 回调，调用 VRFCoordinator 的 `fulfillRandomWords` 逻辑，使 Lottery 获得随机数并确定中奖人；对应 localhost 测试流程步骤 7。 |
| `lottery-get-winner` | 查询并打印当前期次的中奖人地址（调用 Lottery 合约的 `getWinner` / `winner` 等只读函数）；对应 localhost 测试流程步骤 8。 |

> 提示：以上脚本内部通常是对 `npx hardhat run scripts/xxx.ts --network <network>` 的封装，具体请查看 `package.json` 中各个 script 的真实命令。

### 2. 常用 Hardhat 命令（底层命令）

- **测试相关**
  - `npx hardhat test`  
    运行所有 Solidity 与 TypeScript 集成测试，可配合 `--network` 指定网络。

- **本地开发链**
  - `npx hardhat node`  
    启动本地 Hardhat 网络，便于本地部署与调试。

- **Ignition 模块化部署示例**
  - 本地部署 Lottery 模块：
    ```bash
    npx hardhat ignition deploy ignition/modules/LotteryModule.ts --network localhost
    ```
  - 部署到 Sepolia：
    ```bash
    npx hardhat ignition deploy ignition/modules/LotteryModule.ts --network sepolia
    ```
    需要在 `.env.sepolia` 中配置：
    - `SEPOLIA_PRIVATE_KEY`
    - 以及相应 VRF / Lottery 参数

如在 `package.json` 中配置了封装脚本，可以这样使用：

```bash
npm run test
npm run dev:node
npm run lottery-deploy
# 等价于手动执行 npx hardhat ... 命令
```

---

## 五、测试

### 5.1 基础测试命令

```bash
# 本地网络测试（使用 localhost 节点）
npx hardhat test --network localhost

# 使用默认配置（通常连接内置 Hardhat 内存网络）
npx hardhat test
```

### 5.2 localhost 完整测试流程（使用 scripts）

下面以本地网络 `localhost` 为例，演示一个从部署、加入彩票到开奖的完整流程，对应你列出的 8 个步骤。假设你已经在终端中执行：

```bash
npm run dev:node
```

启动了本地 Hardhat 节点。

#### 步骤 1：部署 VRFCoordinator，并写入 `.env.localhost`

```bash
npm run vrf-deploy -- --network localhost
```

- 记录终端输出的 VRFCoordinator 合约地址，例如：`0xVRF...`
- 在 `.env.localhost` 中填入 / 更新：

```env
VRF_COORDINATOR=0xVRF...
```

#### 步骤 2：创建订阅并充值，写入 `SUBSCRIPTION_ID`

```bash
npm run vrf-create-sub -- --network localhost
```

- 记录终端输出的订阅 ID，例如：`1`
- 在 `.env.localhost` 中填入 / 更新：

```env
SUBSCRIPTION_ID=1
```

> 内部通常会使用 Mock LINK Token 或内置逻辑给订阅充值，用于后续随机数请求。

#### 步骤 3：部署 Lottery 合约，并写入 `LOTTERY_ADDRESS`

```bash
npm run lottery-deploy -- --network localhost
```

- 记录终端输出的 Lottery 合约地址，例如：`0xLOTTERY...`
- 在 `.env.localhost` 中填入 / 更新：

```env
LOTTERY_ADDRESS=0xLOTTERY...
```

#### 步骤 4：将 Lottery 添加为 VRF 订阅的消费者

```bash
npm run vrf-add-consume -- --network localhost
```

- 脚本内部会读取：
  - `VRF_COORDINATOR`
  - `SUBSCRIPTION_ID`
  - `LOTTERY_ADDRESS`
- 并将 `LOTTERY_ADDRESS` 添加到指定订阅的 consumer 列表中。

#### 步骤 5：通过 `lottery-enter` 增加参与者

```bash
# 增加一个或多个参与者（具体参数以脚本实现为准）
npm run lottery-enter -- --network localhost
```

- 脚本内部通常会：
  - 从本地账户中选择一个或多个地址
  - 按 `ENTRY_FEE` 金额向 Lottery 合约发送交易，调用 `enter` 函数
- 可多次执行增加多个不同的参与者。

#### 步骤 6：调用 `lottery-draw` 触发抽奖（请求随机数）

```bash
npm run lottery-draw -- --network localhost
```

- 通常由合约 owner / 管理员账户执行
- 脚本会调用 Lottery 合约的开奖函数（内部会向 VRFCoordinator 发起随机数请求）

#### 步骤 7：调用 `vrf-fullfill` 模拟 VRF 回调

```bash
npm run vrf-fullfill -- --network localhost
```

- 在真实链上该步骤由 Chainlink 节点自动完成
- 在 localhost 或测试环境中通过脚本调用 VRFCoordinator 的 `fulfillRandomWords`（或等效接口），将随机数回调给 Lottery 合约，完成开奖流程并确定中奖人。

#### 步骤 8：通过 `lottery-get-winner` 查询中奖人

```bash
npm run lottery-get-winner -- --network localhost
```

- 调用 Lottery 合约的只读接口，打印当前期次的中奖人地址
- 如果前面步骤都执行成功，你应能在终端看到类似：

```text
Winner: 0x1234...abcd
```

---

## 六、部署流程概览（跨网络）

1. **准备环境变量**
   - 根据目标网络创建 `.env.<network>`，填入 VRF、彩票及账户配置。

2. **启动本地链（如需本地调试）**
   ```bash
   npx hardhat node
   ```

3. **使用 Ignition 部署 VRFCoordinator 与 Lottery 合约**
   ```bash
   npx hardhat ignition deploy ignition/modules/VRFCoordinatorModule.ts --network <network>
   npx hardhat ignition deploy ignition/modules/LotteryModule.ts        --network <network>
   ```

4. **更新 `.env.<network>` 中的合约地址**
   - 将部署输出的 `VRF_COORDINATOR`、`LOTTERY_ADDRESS` 等地址写回对应 `.env` 文件。

5. **运行集成测试 / 使用前端进行交互**

---

## 七、贡献与许可证

- 欢迎提交 Issue / PR 改进合约逻辑与部署脚本。
- 许可证（如有）：请在此处添加 `MIT` / `Apache-2.0` 等说明。