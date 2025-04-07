"use client";
import ButtonBack from "@/components/ButtonBack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@solana/wallet-adapter-react";
import { redirect } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export default function page() {
  const { publicKey } = useWallet();
  const user = publicKey?.toString();

  const [name, setName] = React.useState<string>("");

  async function sendUserData() {
    toast("success user data", {
      description: name + " " + user,
    });

    redirect("/chats");
  }

  return (
    <main className="space-y-5 max-w-sm mx-auto p-5">
      <ButtonBack />
      {!publicKey && (
        <div className="flex flex-col space-y-3">
          <h1 className="text-muted-foreground">
            Please connect your wallet first.
          </h1>
          <WalletConnect />
        </div>
      )}
      {publicKey && (
        <>
          <section>
            <WalletConnect />
            <h1 className="text-2xl font-semibold mt-2">
              Let us more know about you
            </h1>
            <p className="text-sm text-muted-foreground">
              You have full control over access to personal data.
            </p>
          </section>
          <section className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                type="text"
                placeholder={`${user?.slice(0, 10)}...${user?.slice(-5)}`}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button onClick={sendUserData} disabled={!name}>
              Save Profile
            </Button>
          </section>
        </>
      )}
    </main>
  );
}
