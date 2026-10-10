import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CheckInPanel from "../../../../components/CheckInPanel";
import type { Room } from "../../../../types/room";

type CheckInPageProps = { params: Promise<{ id: string }> };

export default async function CheckInPage({ params }: CheckInPageProps) {
  const t = await getTranslations("checkInPage");
  const { id } = await params;
  const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3002"}/rooms/${id}`, { cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error(t("loadError"));
  const room: Room = await response.json();

  return (
    <main className="flex-none bg-[#F4F8FA] pb-8 text-[#102A43] md:flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 md:px-8 lg:py-10">
        <Link href={`/rooms/${room.id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#075985] transition hover:opacity-70 sm:mb-6"><span aria-hidden="true">←</span>{t("back")}</Link>
        <CheckInPanel room={room} />
      </div>
    </main>
  );
}
