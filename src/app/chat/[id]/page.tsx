import { AvatarUser } from "@/components/AvatarUser";
import React from "react";
import ChatContainer from "../../../components/ChatContainer";

export default async function page({ params }: { params: any }) {
  const { id } = await params;
  return (
    <main>
      {/* <header className="border-b p-3">
        <p>Back</p>
        <div className="justify-items-center mx-auto space-y-5">
          <AvatarUser />
          <p>{id}</p>
        </div>
      </header> */}
    </main>
  );
}
