"use client";

import { useEffect } from "react";
import { initializeClientIdentity } from "@/lib/client-id";

export default function ClientIdentityInitializer() {
  useEffect(() => {
    void initializeClientIdentity().catch((error) => {
      console.error("Client identity initialization failed:", error);
    });
  }, []);

  return null;
}
