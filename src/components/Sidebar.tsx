"use client";
import { supabase } from "@/utils/supabase";
import React from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type chatGroupsType = {
  id: number;
  name: string;
};
export default function Sidebar() {
  const [groups, setGroups] = React.useState<chatGroupsType[] | null>([]);

  async function fetchListGroups() {
    const { data } = await supabase.from("chat_groups").select("*");
    setGroups(data);
  }

  React.useEffect(() => {
    fetchListGroups();
  }, [fetchListGroups]);

  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="border max-w-60 w-full h-screen space-y-5">
      <h1 className="p-3">LIST CHAT BETTING</h1>
      <ScrollArea>
        {groups?.map((data: chatGroupsType) => (
          <div
            className={`flex items-center gap-3 p-3 hover:bg-accent duration-100 cursor-pointer ${
              pathname === `/chat/${data.id}` ? "bg-accent" : ""
            }`}
            key={data.id}
            onClick={() => {
              router.push(`/chat/${data.id}`);
            }}
          >
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p>{data.name}</p>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
