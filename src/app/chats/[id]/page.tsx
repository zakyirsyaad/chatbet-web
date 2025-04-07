import ButtonBack from "@/components/ButtonBack";
import Messages from "@/components/Messages";
import { Users } from "lucide-react";
import React from "react";

export default function page({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <main className="max-w-sm mx-auto p-5 space-y-5">
      <ButtonBack />
      <section className="flex items-center gap-2">
        <Users size={40} />
        <div>
          <h1 className="text-xl font-semibold mt-2">Group {id}</h1>
          <h2 className="text-sm text-muted-foreground">3 Member</h2>
        </div>
      </section>
      <hr />
      <Messages groupId={Number(id)} />
    </main>
  );
}

const groups = [
  {
    id: 1,
    name: "Group 1",
    members: ["Member 1", "Member 2", "Member 3"],
    lastMessage: "Hello!",
    lastMessageTime: "10:00 AM",
  },
  {
    id: 2,
    name: "Group 2",
    members: ["Member A", "Member B", "Member C"],
    lastMessage: "Hi there!",
    lastMessageTime: "11:30 AM",
  },
  {
    id: 3,
    name: "Group 3",
    members: ["User X", "User Y", "User Z"],
    lastMessage: "Good morning!",
    lastMessageTime: "9:15 AM",
  },
];
