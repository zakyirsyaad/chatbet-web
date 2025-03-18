"use client";
import React from "react";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowDown,
  Send,
  Users,
  Settings,
  PlusCircle,
  Menu,
} from "lucide-react";
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

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  chat_group_id: string;
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

export default function ChatContainer() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [chatGroupId, setChatGroupId] = useState("1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const [notification, setNotification] = useState(0);
  const [optimisticIds] = useState<number[]>([]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
      setNotification(0);
      setUserScrolled(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_group_id", chatGroupId)
        .order("timestamp", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      // Scroll to bottom after messages are loaded
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chatGroupId, scrollToBottom]);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          if (!optimisticIds.includes(payload.new.id)) {
            const newMessage: Message = {
              id: payload.new.id,
              sender: payload.new.sender,
              content: payload.new.content,
              timestamp: payload.new.timestamp,
              chat_group_id: payload.new.chat_group_id,
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            // Check if user is near bottom before auto-scrolling
            const scrollContainer = scrollRef.current;
            if (scrollContainer) {
              const isNearBottom =
                scrollContainer.scrollHeight -
                  scrollContainer.scrollTop -
                  scrollContainer.clientHeight <
                100;

              if (isNearBottom) {
                setTimeout(scrollToBottom, 100);
              } else {
                setNotification((prev) => prev + 1);
              }
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== payload.old.id)
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prevMessages) =>
            prevMessages.map((message) =>
              message.id === payload.new.id
                ? {
                    id: payload.new.id,
                    sender: payload.new.sender,
                    content: payload.new.content,
                    timestamp: payload.new.timestamp,
                    chat_group_id: payload.new.chat_group_id,
                  }
                : message
            )
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [chatGroupId, fetchMessages, optimisticIds, scrollToBottom]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (!userScrolled && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, userScrolled, scrollToBottom]);

  const handleOnScroll = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const isNearBottom =
        scrollContainer.scrollHeight -
          scrollContainer.scrollTop -
          scrollContainer.clientHeight <
        100;

      setUserScrolled(!isNearBottom);
      if (isNearBottom) {
        setNotification(0);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      sender: "Pengirim", // Replace with actual user authentication
      content: newMessage,
      chat_group_id: chatGroupId,
      timestamp: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("messages").insert([messageData]);
      if (error) throw error;
      setNewMessage("");
      setUserScrolled(false);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
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
            className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
              chatGroupId === group.id ? "bg-accent" : ""
            }`}
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

  const currentGroup = groups.find((g) => g.id === chatGroupId);

  return (
    <div className="flex bg-background">
      <div className="hidden md:block md:w-80 border-r flex-shrink-0">
        <Sidebar />
      </div>
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col">
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
              <h2 className="font-semibold">{currentGroup?.name}</h2>
              <p className="text-sm text-muted-foreground">8 members</p>
            </div>
          </div>
          <Button variant="outline" className="hidden sm:flex">
            <Users className="h-4 w-4 mr-2" />
            Members
          </Button>
        </div>

        <ScrollArea
          className="flex-1 p-4"
          ref={scrollRef}
          onScroll={handleOnScroll}
        >
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No messages yet
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <Card className="p-3 max-w-[80%] bg-accent">
                    <p className="break-words">{msg.content}</p>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Attachments</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Image</DropdownMenuItem>
                <DropdownMenuItem>Document</DropdownMenuItem>
                <DropdownMenuItem>Link</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !newMessage.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>
      {userScrolled && (
        <div className="absolute bottom-20 w-full pointer-events-none">
          <div className="max-w-3xl mx-auto px-4 pointer-events-auto">
            {notification > 0 ? (
              <div
                className="bg-primary text-primary-foreground py-2 px-4 rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors inline-flex items-center gap-2 ml-auto"
                onClick={scrollToBottom}
              >
                <span>
                  {notification} new message{notification > 1 ? "s" : ""}
                </span>
                <ArrowDown className="h-4 w-4" />
              </div>
            ) : (
              <div
                className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all ml-auto"
                onClick={scrollToBottom}
              >
                <ArrowDown className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
