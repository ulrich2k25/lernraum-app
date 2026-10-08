"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoomDetailAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    function refreshRoom() {
      if (!document.hidden) {
        router.refresh();
      }
    }

    const interval = window.setInterval(refreshRoom, 5000);

    function handleVisibilityChange() {
      if (!document.hidden) {
        router.refresh();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [router]);

  return null;
}
