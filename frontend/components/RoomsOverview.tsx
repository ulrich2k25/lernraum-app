import { getTranslations } from "next-intl/server";
import type { Room } from "../types/room";
import LiveRoomsGrid from "./LiveRoomsGrid";

type RoomsOverviewProps = { rooms: Room[] };

export default async function RoomsOverview({ rooms }: RoomsOverviewProps) {
  const t = await getTranslations("roomsOverview");
  return (
    <section className="relative">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F8B8D]" />

            <p className="text-xs font-medium uppercase tracking-[0.09em] text-[#5C7582]">
              {t("eyebrow")}
            </p>
          </div>

          <h2 className="text-[25px] font-semibold tracking-tight text-[#153C52] sm:text-[28px]">
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
