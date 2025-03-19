import { supabase } from "@/utils/supabase";
import { Users } from "lucide-react";
import React from "react";

export default async function HeaderGroup({ groupId }: { groupId: number }) {
  const { data: groups } = await supabase
    .from("chat_groups")
    .select("*")
    .eq("id", groupId);

  const { data: messages } = await supabase
    .from("messages")
    .select("sender")
    .eq("chat_group_id", groupId);

  const uniqueSenders = Array.from(
    new Set(messages?.map((message) => message.sender))
  ).join(", ");
  return (
    <div className="border p-3">
      {groups?.map((data) => (
        <div className="flex items-center gap-3" key={data.id}>
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p>{data.name}</p>
            <p className="text-sm text-muted-foreground">
              {uniqueSenders.slice(0, 23)}...
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
