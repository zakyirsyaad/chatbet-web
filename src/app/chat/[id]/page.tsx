import HeaderGroup from "@/components/HeaderGroup";
import Messages from "@/components/Messages";
import React from "react";

interface Params {
  id: number;
}

export default async function page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return (
    <main className="w-full">
      <HeaderGroup groupId={id} />
      <Messages groupId={id} />
    </main>
  );
}
