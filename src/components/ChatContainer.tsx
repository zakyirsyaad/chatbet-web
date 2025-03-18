"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Send, Users, Settings, PlusCircle, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import io from "socket.io-client";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface ChatGroup {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const socket = io("http://localhost:3000/socket");

export default function ChatContainer() {
  const [message, setMessage] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatGroupId, setChatGroupId] = useState("1"); // Default chat group

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_group_id", chatGroupId)
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();

    socket.emit("joinRoom", chatGroupId);

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [chatGroupId]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const { data, error } = await supabase.from("messages").insert([
        {
          sender: "User",
          content: message,
          chat_group_id: chatGroupId,
          timestamp: new Date(),
        },
      ]);

      if (error) {
        console.error("Error sending message:", error);
      } else {
        socket.emit("sendMessage", {
          chatGroupId,
          sender: "User",
          content: message,
        });
        setMessage("");
      }
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Chats</h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Search chats..." className="flex-1" />
          <Button size="icon" variant="ghost">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        {groups.map((group) => (
          <div
            key={group.id}
            className="p-4 hover:bg-accent cursor-pointer transition-colors"
            onClick={() => {
              setIsMobileSidebarOpen(false);
              setChatGroupId(group.id);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{group.name}</h3>
                  {group.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {group.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {group.lastMessage}
                </p>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );

  // Mock data - replace with real data in production
  const groups: ChatGroup[] = [
    {
      id: "1",
      name: "Team Alpha",
      lastMessage: "Great work everyone!",
      unreadCount: 2,
    },
    {
      id: "2",
      name: "Project Beta",
      lastMessage: "Meeting at 3 PM",
      unreadCount: 0,
    },
    {
      id: "3",
      name: "General",
      lastMessage: "Thanks for the update",
      unreadCount: 1,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-80 border-r flex-shrink-0">
        <Sidebar />
      </div>
      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Team Alpha</h2>
              <p className="text-sm text-muted-foreground">8 members</p>
            </div>
          </div>
          <Button variant="outline" className="hidden sm:flex">
            <Users className="h-4 w-4 mr-2" />
            Members
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{msg.sender}</span>
                  <span className="text-xs text-muted-foreground">
                    {/* {msg.timestamp.toLocaleTimeString()} */}
                  </span>
                </div>
                <Card className="p-3 max-w-[80%] bg-accent">
                  <p className="break-words">{msg.content}</p>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <PlusCircle />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="shrink-0">
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
