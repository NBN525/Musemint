// app/success/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic"; // <-- stops prerendering

function Inner() {
  const q = useSearchParams();
  const sessionId = q.get("session_id") || "";
  const downloadUrl = process.env.NEXT_PUBLIC_PRODUCT_DOWNLOAD_URL;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div
