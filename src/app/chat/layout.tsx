"use client";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WalletConnect from "@/components/WalletConnect";
import { supabase } from "@/utils/supabase";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useState, useEffect } from "react";

type userType = {
  id: string;
  username: string;
  profile_photo: string;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<userType | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (publicKey) {
      fetchUser();
    }
  }, [publicKey]);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", publicKey?.toString());
      if (error) throw error;
      setUser(users?.[0] || null);
    } catch (err) {
      setError("Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async () => {
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const user: userType = {
        id: publicKey?.toString() || "ERROR",
        username: username.trim(),
        profile_photo: "foto",
      };
      const { data, error } = await supabase
        .from("users")
        .insert([user])
        .select();
      if (error) throw error;
      setUser(data?.[0] || null);
      setSuccess("User created successfully!");
    } catch (err) {
      setError("Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey && !connection) {
    return (
      <div className="flex flex-col space-y-2 items-center justify-center min-h-screen">
        <p>Please Connect Your Wallet to get started.</p>
        <WalletConnect />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-5xl border p-6 space-y-5 rounded">
          <div>
            <p className="text-lg font-medium">Create User</p>
            <p className="text-sm text-muted-foreground">
              Fill in your username before you can chat with others.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <Button onClick={saveUser} disabled={loading || !username.trim()}>
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log(user);

  return (
    <div className="flex">
      <Sidebar />
      {children}
    </div>
  );
}
