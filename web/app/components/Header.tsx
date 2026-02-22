"use client";

import { ConnectButton } from "web3uikit";

export function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm overflow-visible">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3 overflow-visible">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          Lottery DApp
        </h1>
        <div className="relative z-50">
          <ConnectButton moralisAuth={false} />
        </div>
      </div>
    </header>
  );
}
