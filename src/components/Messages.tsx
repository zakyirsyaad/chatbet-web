"use client";
import { supabase } from "@/utils/supabase";
import React from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { PlusCircle, SendHorizonal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@solana/wallet-adapter-react";

type Message = {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  chat_group_id: number;
};

export default function Messages({ groupId }: { groupId: number }) {
  const [messages, setMessages] = React.useState<Message[] | null>();
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
  const [newMessage, setNewMessage] = React.useState("");
  // const [pending, setPending] = React.useState<boolean>(false);

  async function fetchMessages() {
    // setPending(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_group_id", groupId)
      .order("timestamp", { ascending: true });

    setMessages(data);
    // setPending(false);
  }

  React.useEffect(() => {
    fetchMessages();
  }, [groupId]);

  const scrollToBottom = () => {
    scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { publicKey } = useWallet();

  async function sendMessage() {
    const messageData = {
      sender: publicKey,
      content: newMessage,
      chat_group_id: groupId,
      timestamp: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("messages").insert([messageData]);
      if (error) alert(error);
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      alert(`Error sending message: ${error}`);
    }
  }
  return (
    <div className="space-y-5">
      <ScrollArea className="h-1/2 mx-auto max-w-3xl">
        <div className="space-y-5">
          {messages?.map((data: Message) => {
            return (
              <div key={data.id} className="space-y-1" ref={scrollAreaRef}>
                <div className="flex gap-5 items-center">
                  <p className="font-medium">
                    {data.sender?.slice(0, 5)}...{data.sender?.slice(-3)}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(data.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="bg-accent w-fit rounded p-2">{data.content}</p>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="mx-auto max-w-3xl flex gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <PlusCircle className="h-7 w-7" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Attachments</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Start Bet</DropdownMenuItem>
            <DropdownMenuItem>Send Image</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && newMessage) {
              sendMessage();
            }
          }}
        />
        <Button onClick={sendMessage} disabled={!newMessage}>
          <SendHorizonal />
        </Button>
      </div>
    </div>
  );
}
