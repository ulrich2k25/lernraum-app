import type { Room } from "../types/room";
import AppHeader from "../components/AppHeader";
import AppNavigation from "../components/AppNavigation";
import HomeHero from "../components/HomeHero";
import RoomsOverview from "../components/RoomsOverview";

export default async function Home() {
  const response = await fetch("http://localhost:3002/rooms", {
    cache: "no-store",
  });

  const rooms: Room[] = await response.json();

  return (
    <main className="min-h-screen bg-[#F4F8FA] pb-24 text-[#102A43] md:pb-0">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:px-8 lg:py-10">
        <AppHeader roomCount={rooms.length} />

        <AppNavigation />

        <HomeHero />

        <RoomsOverview rooms={rooms} />

        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          Projekt 1 · Hochschule Kaiserslautern
        </footer>
      </div>
    </main>
  );
}
