"use client";
import Homepage from "@/components/homepage/Homepage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

  const {data: session, status} = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      router.push(`/myCanvases/${session.user.id}`);
    }
  }, [status, session, router]);
  
  return <Homepage />;  
}
