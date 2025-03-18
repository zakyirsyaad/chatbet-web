import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="h-[calc(100vh-20vh)] flex items-center justify-center">
      <Button asChild>
        <Link href={"/chat"}>Create Group Chat</Link>
      </Button>
    </main>
  );
}
