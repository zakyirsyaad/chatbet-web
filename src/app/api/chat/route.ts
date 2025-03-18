// /api/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  const { sender, content, chatGroupId } = await request.json();

  const { data, error } = await supabase
    .from("messages")
    .insert([
      { sender, content, chat_group_id: chatGroupId, timestamp: new Date() },
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatGroupId = searchParams.get("chatGroupId");

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_group_id", chatGroupId)
    .order("timestamp", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
