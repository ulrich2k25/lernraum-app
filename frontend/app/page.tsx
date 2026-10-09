import type { Room } from "../types/room";
import AppHeader from "../components/AppHeader";
import AppNavigation from "../components/AppNavigation";
import HomeHero from "../components/HomeHero";
import RoomsOverview from "../components/RoomsOverview";

export default async function Home() {
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3002"}/rooms`, {
    cache: "no-store",
  });

  const rooms: Room[] = await response.json();

  return (
    <main className="bg-[#E8F0F5] text-[#102A43] md:bg-[#F4F8FA]">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 md:px-8 lg:py-7">
        <AppHeader roomCount={rooms.length} />

        <AppNavigation />

        <HomeHero />

        <RoomsOverview rooms={rooms} />
      </div>
    </main>
  );
}
