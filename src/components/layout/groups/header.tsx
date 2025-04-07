"use client";
import { Button } from "@/components/ui/button";
import { LogIn, Plus } from "lucide-react";
import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import WalletConnect from "@/components/WalletConnect";
import { redirect } from "next/navigation";

export default function Header() {
  const { publicKey } = useWallet();
  const user = publicKey?.toString();

  if (!user) {
    redirect("/account");
  }
  return (
    <header className="space-y-5 mb-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Chats</h1>
        <WalletConnect />
      </div>
      <div className="space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Group Chat</DialogTitle>
              <DialogDescription>
                This will create a new group chat with full controll over
                personal data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="group-name" className="text-sm font-medium">
                Group Name
              </Label>
              <Input
                type="text"
                id="group-name"
                placeholder="Enter group name"
              />
            </div>
            <div className="space-x-2 mt-4 flex justify-end">
              <Button variant="outline">Cancel</Button>
              <Button>Continue</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <LogIn />
              Join Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
