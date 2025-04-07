import { Users } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ListGroups() {
  return (
    <section>
      {groups.map((group) => (
        <Link href={`/chats/${group.id}`} key={group.id}>
          <div className="flex items-center justify-between p-3 border-b hover:bg-secondary duration-300 ease-in-out cursor-pointer">
            <div className="flex items-center space-x-3">
              <Users />
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-xs">{group.members.join(", ")}</p>
                <p className="text-sm text-muted-foreground">
                  {group.lastMessage}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{group.lastMessageTime}</p>
            </div>
          </div>
        </Link>
      ))}
    </section>
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
