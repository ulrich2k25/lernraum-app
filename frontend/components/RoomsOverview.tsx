import type { Room } from "../types/room";
import RoomCard from "./RoomCard";

type RoomsOverviewProps = {
  rooms: Room[];
};

export default function RoomsOverview({ rooms }: RoomsOverviewProps) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0F8B8D]">
            Übersicht
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#102A43] sm:text-2xl">
            Lernräume
          </h2>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="rounded-[26px] border border-dashed border-[#B7CBD4] bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF7FA] text-xl text-[#075985]">
            ⌂
          </div>

          <h3 className="mt-4 font-bold text-[#102A43]">
            Keine Lernräume verfügbar
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Aktuell stehen keine Lernräume zur Verfügung.
          </p>
        </div>
      )}
    </section>
  );
}
