"use client";
import Sidebar from "@/components/Sidebar";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@solana/wallet-adapter-react";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();

  if (!publicKey)
    return (
      <div className="flex flex-col space-y-2 items-center justify-center min-h-screen">
        <p>Please Connect Your Wallet to get</p>
        <WalletConnect />
      </div>
    );
  return (
    <div className="flex">
      <Sidebar />
      {children}
    </div>
  );
}
