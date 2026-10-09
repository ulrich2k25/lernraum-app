"use client";

import { useEffect, useState } from "react";
import type { Room } from "../types/room";
import RoomCard from "./RoomCard";

type LiveRoomsGridProps = {
  initialRooms: Room[];
  emptyTitle: string;
  emptyText: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export default function LiveRoomsGrid({
  initialRooms,
  emptyTitle,
  emptyText,
}: LiveRoomsGridProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  useEffect(() => {
    const controller = new AbortController();
    let requestInProgress = false;

    async function refreshRooms() {
      if (document.hidden || requestInProgress) {
        return;
      }

      requestInProgress = true;

      try {
        const response = await fetch(`${API_URL}/rooms`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to refresh rooms");
        }

        const updatedRooms: Room[] = await response.json();

        if (!controller.signal.aborted) {
          setRooms(updatedRooms);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Rooms refresh error:", error);
        }
      } finally {
        requestInProgress = false;
      }
    }

    const interval = window.setInterval(() => {
      void refreshRooms();
    }, 5000);

    function handleVisibilityChange() {
      if (!document.hidden) {
        void refreshRooms();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="rounded-[26px] border border-dashed border-[#B7CBD4] bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF7FA] text-xl text-[#075985]">
            ⌂
          </div>

          <h3 className="mt-4 font-bold text-[#102A43]">{emptyTitle}</h3>

          <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
        </div>
      )}
    </>
  );
}
