import { Button } from "@/components/ui/button";
import WalletConnectButton from "@/components/WalletConnect";
import Link from "next/link";

export default function Home() {
  return (
    <main className="h-[calc(100vh-20vh)] flex flex-col gap-5 items-center justify-center">
      <Button asChild>
        <Link href={"/chat"}>Create Group Chat</Link>
      </Button>
      <WalletConnectButton />
    </main>
  );
}
