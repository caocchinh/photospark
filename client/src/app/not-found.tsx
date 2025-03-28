"use client";

import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function NotFound() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      router.push("/");
    }
  }, [router]);
}
