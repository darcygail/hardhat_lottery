"use client";

import { useEffect, useMemo, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import lotteryArtifact from "../../artifacts/contracts/Lottery.sol/Lottery.json";
import contactAdddressDict from "../contact/address.json";

type LotteryViewState = {
  playersCount: number | null;
  jackpot: string | null;
  entryFee: string | null;
  loading: boolean;
  error?: string;
};

export default function Home() {
  const { isWeb3Enabled, chainId } = useMoralis();
  const LOTTERY_ADDRESS = chainId ? contactAdddressDict[Number(chainId)] : undefined;
  const [state, setState] = useState<LotteryViewState>({
    playersCount: null,
    jackpot: null,
    entryFee: null,
    loading: false,
  });
  const [entryAmount, setEntryAmount] = useState<string>("");

  const abi = useMemo(() => lotteryArtifact.abi as unknown as object, []);

  const {
    runContractFunction: runGetEntryFee,
    isFetching: loadingEntryFee,
  } = useWeb3Contract({
    abi,
    contractAddress: LOTTERY_ADDRESS,
    functionName: "getEntryFee",
  });

  const {
    runContractFunction: runGetPlayers,
    isFetching: loadingPlayers,
  } = useWeb3Contract({
    abi,
    contractAddress: LOTTERY_ADDRESS,
    functionName: "getPlayers",
  });

  const {
    runContractFunction: runGetJackpot,
    isFetching: loadingJackpot,
  } = useWeb3Contract({
    abi,
    contractAddress: LOTTERY_ADDRESS,
    functionName: "getJackpot",
  });

  const {
    runContractFunction: runEnter,
    isFetching: entering,
  } = useWeb3Contract({
    abi,
    contractAddress: LOTTERY_ADDRESS,
    functionName: "enter",
  });

  async function refreshData() {
    if (!isWeb3Enabled) return;
    try {
      setState((s) => ({ ...s, loading: true, error: undefined }));

      const [entryFeeRaw, players, jackpotRaw] = (await Promise.all([
        runGetEntryFee(),
				runGetPlayers(),
				runGetJackpot(),
      ])) as [unknown, unknown, unknown];

      const entryFeeWei =
        typeof entryFeeRaw === "string"
          ? entryFeeRaw
          : (entryFeeRaw as { toString: () => string } | null)?.toString() ??
            "0";
      const entryFeeEth = Number(entryFeeWei) / 1e18;

      const playersArray = Array.isArray(players) ? players : [];

      const jackpotWei =
        typeof jackpotRaw === "string"
          ? jackpotRaw
          : (jackpotRaw as { toString: () => string } | null)?.toString() ??
            "0";
      const jackpotEth = Number(jackpotWei) / 1e18;

      setState({
        playersCount: playersArray.length,
        jackpot: jackpotEth.toString(),
        entryFee: entryFeeEth.toString(),
        loading: false,
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load lottery data",
      }));
    }
  }

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled]);

  async function handleEnter() {
    const amount = entryAmount.trim() || state.entryFee;
    if (!amount) return;
    try {
      setState((s) => ({ ...s, error: undefined }));
      const res = await runEnter({
        params: {
          contractAddress: LOTTERY_ADDRESS,
          abi,
          functionName: "enter",
          msgValue: (Number(amount) * 1e18).toString(),
        },
      } as Parameters<typeof runEnter>[0]);

      // Try to refresh immediately and again after a short delay to cover async mining
      await refreshData();
      setTimeout(() => {
        refreshData().catch(() => {});
      }, 4000);

      // If the returned object is a transaction with wait(), await confirmation then refresh once more
      try {
        if (res && typeof (res as any).wait === "function") {
          await (res as any).wait(1);
          await refreshData();
        }
      } catch (e) {
        // ignore wait errors
      }
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e instanceof Error ? e.message : "Failed to enter lottery",
      }));
    }
  }

  const isLoading =
		state.loading || loadingEntryFee || loadingPlayers || loadingJackpot;

  return (
    <main className="min-h-[60vh] flex justify-center px-4 py-10">
      <section className="w-4/5 max-w-4xl rounded-2xl border border-sky-100 bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-slate-900">Lottery 合约信息</h2>
        <div className="space-y-2 text-sm break-all text-slate-700">
          <div>
            <span className="font-medium">合约地址: </span>
            <span>{LOTTERY_ADDRESS}</span>
          </div>
          <div>
            <span className="font-medium">当前参与人数: </span>
            <span>
              {state.playersCount !== null ? state.playersCount : isLoading ? "加载中..." : "-"}
            </span>
          </div>
          <div>
					<span className="font-medium">当前奖池: </span>
            <span>
              {state.jackpot !== null ? `${state.jackpot} ETH` : isLoading ? "加载中..." : "-"}
            </span>
          </div>
          <div>
            <span className="font-medium">门槛: </span>
            <span>
              {state.entryFee !== null ? `${state.entryFee} ETH` : isLoading ? "加载中..." : "-"}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:flex sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="entry-amount" className="text-xs text-slate-600">
              参与金额 (ETH)
            </label>
            <input
              id="entry-amount"
              type="number"
              min="0"
              step="0.0001"
              inputMode="decimal"
              placeholder={state.entryFee ? `默认 ${state.entryFee}` : "0.01"}
              value={entryAmount}
              onChange={(event) => setEntryAmount(event.target.value)}
              className="w-32 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="button"
            onClick={handleEnter}
            disabled={!isWeb3Enabled || !(entryAmount.trim() || state.entryFee) || entering}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
         >
            {entering ? "提交中..." : "参加抽奖"}
          </button>
          <button
            type="button"
            onClick={refreshData}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-slate-700 bg-white hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            刷新数据
          </button>
        </div>

        {state.error && (
          <p className="mt-3 text-xs text-red-500">错误: {state.error}</p>
        )}

        {!isWeb3Enabled && (
          <p className="mt-3 text-xs text-amber-500">
            请先在顶部 Header 使用 Connect Wallet 连接钱包。
          </p>
        )}
      </section>
    </main>
  );
}
