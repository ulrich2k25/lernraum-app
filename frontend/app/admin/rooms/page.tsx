"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import AdminRoomQrCode from "@/components/AdminRoomQrCode";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type AdminRoom = {
  id:number; raumBezeichnung:string; gebaeude:string; etage:string; kapazitaet:number;
  status:"ACTIVE"|"INACTIVE"; raumToken:string; autoCloseWhenEmpty:boolean;
  isTemporarilyClosed:boolean; aktiveSitzungen:number; freiePlaetze:number;
};

export default function AdminRoomsPage() {
  const t = useTranslations("adminRooms");
  const tc = useTranslations("adminCommon");
  const router = useRouter();
  const [rooms,setRooms]=useState<AdminRoom[]>([]);
  const [isLoading,setIsLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [selectedQrRoomId,setSelectedQrRoomId]=useState<number|null>(null);

  useEffect(()=>{
    const token=localStorage.getItem("lernraum-admin-token");
    if(!token){router.replace("/admin/login");return;}
    async function loadRooms(){
      try{
        const response=await fetch(`${API_URL}/admin/rooms`,{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});
        if(response.status===401){localStorage.removeItem("lernraum-admin-token");localStorage.removeItem("lernraum-admin");router.replace("/admin/login");return;}
        if(!response.ok) throw new Error(t("loadError"));
        setRooms((await response.json()) as AdminRoom[]);
      }catch(error){setError(error instanceof Error?error.message:t("loadError"));}
      finally{setIsLoading(false);}
    }
    void loadRooms();
  },[router,t]);

  function handleLogout(){localStorage.removeItem("lernraum-admin-token");localStorage.removeItem("lernraum-admin");router.push("/admin/login");}
  function toggleQrCode(roomId:number){setSelectedQrRoomId((current)=>current===roomId?null:roomId);}

  return <main className="min-h-screen bg-[#F4F8FA] text-[#102A43]"><div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
    <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#075985]">{tc("management")}</p><h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("title")}</h1><p className="mt-2 text-sm text-slate-500">{t("description")}</p></div>
      <div className="flex flex-wrap gap-3"><Link href="/admin/rooms/new" className="rounded-xl bg-[#075985] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#064e73]">{t("add")}</Link><button type="button" onClick={handleLogout} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">{t("logout")}</button></div>
    </header>

    {isLoading&&<div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">{t("loading")}</div>}
    {error&&<div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">{error}</div>}
    {!isLoading&&!error&&rooms.length===0&&<div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h2 className="text-lg font-bold text-slate-900">{t("emptyTitle")}</h2><p className="mt-2 text-sm text-slate-500">{t("emptyText")}</p></div>}

    {!isLoading&&!error&&rooms.length>0&&<section className="grid gap-5 md:grid-cols-2">{rooms.map((room)=><article key={room.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-900">{room.raumBezeichnung}</h2><p className="mt-1 text-sm text-slate-500">{room.gebaeude} · {room.etage}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${room.status==="ACTIVE"?"bg-emerald-100 text-emerald-700":"bg-slate-200 text-slate-600"}`}>{room.status==="ACTIVE"?tc("active"):tc("inactive")}</span></div>
      <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#F4F8FA] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{tc("capacity")}</p><p className="mt-1 text-xl font-bold text-slate-900">{room.kapazitaet}</p></div><div className="rounded-2xl bg-[#F4F8FA] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t("freeSeats")}</p><p className="mt-1 text-xl font-bold text-[#075985]">{room.freiePlaetze}</p></div><div className="col-span-2 rounded-2xl bg-[#F4F8FA] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t("activeSessions")}</p><p className="mt-1 text-xl font-bold text-slate-900">{room.aktiveSitzungen}</p></div></div>
      <div className="mt-5 flex gap-3"><button type="button" onClick={()=>toggleQrCode(room.id)} className="flex-1 rounded-xl border border-[#075985] px-4 py-3 text-sm font-semibold text-[#075985] transition hover:bg-[#075985]/5">{selectedQrRoomId===room.id?t("qrClose"):t("qr")}</button><Link href={`/admin/rooms/${room.id}/edit`} className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">{t("edit")}</Link></div>
      {selectedQrRoomId===room.id&&<div className="mt-5"><AdminRoomQrCode raumBezeichnung={room.raumBezeichnung} gebaeude={room.gebaeude} etage={room.etage} raumToken={room.raumToken}/></div>}
    </article>)}</section>}
  </div></main>;
}
