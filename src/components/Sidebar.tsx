"use client";
import { supabase } from "@/utils/supabase";
import React from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Plus, User, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./ui/input";

type chatGroupsType = {
  id: number;
  name: string;
};
export default function Sidebar() {
  const [groups, setGroups] = React.useState<chatGroupsType[] | null>([]);
  const [newGroup, setNewGroup] = React.useState("");

  async function fetchListGroups() {
    const { data } = await supabase.from("chat_groups").select("*");
    setGroups(data);
  }

  React.useEffect(() => {
    fetchListGroups();
  }, [fetchListGroups]);

  const pathname = usePathname();

  const { publicKey } = useWallet();

  async function createGroup() {
    const groupData = {
      name: newGroup,
    };

    try {
      const { error } = await supabase
        .from("chat_groups")
        .insert([groupData])
        .eq("user_id", publicKey);
    } catch (error) {
      alert(`Error sending message: ${error}`);
    }
  }

  return (
    <div className="border max-w-60 w-full h-screen space-y-5">
      <div className="flex gap-3 items-center p-3 border-b">
        <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p>USER A</p>
          <p className="text-sm text-muted-foreground">
            {publicKey?.toBase58().slice(0, 5)}
            ...
            {publicKey?.toBase58().slice(-5)}
          </p>
        </div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="w-full" size={"lg"}>
            <Plus />
            Create Group
          </Button>
        </PopoverTrigger>
        <PopoverContent className="space-y-3">
          <p className="text-sm">Name Group</p>
          <Input
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && newGroup) {
                createGroup();
              }
            }}
          />
          <Button onClick={createGroup} disabled={!newGroup}>
            Create
          </Button>
        </PopoverContent>
      </Popover>

      <ScrollArea>
        {groups?.map((data: chatGroupsType) => (
          <Link href={`/chat/${data.id}`} key={data.id}>
            <div
              className={`flex items-center gap-3 p-3 hover:bg-accent duration-100 cursor-pointer ${
                pathname === `/chat/${data.id}` ? "bg-accent" : ""
              }`}
            >
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p>{data.name}</p>
            </div>
          </Link>
        ))}
      </ScrollArea>
    </div>
  );
}
