import { getTranslations } from "next-intl/server";
import type { Room } from "../types/room";
import LiveRoomsGrid from "./LiveRoomsGrid";

type RoomsOverviewProps = { rooms: Room[] };

export default async function RoomsOverview({ rooms }: RoomsOverviewProps) {
  const t = await getTranslations("roomsOverview");
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0F8B8D]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#102A43] sm:text-2xl">
            {t("title")}
          </h2>
        </div>
      </div>
      <LiveRoomsGrid
        initialRooms={rooms}
        emptyTitle={t("emptyTitle")}
        emptyText={t("emptyText")}
      />
    </section>
  );
}
