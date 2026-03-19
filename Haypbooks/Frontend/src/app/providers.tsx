"use client";
import { ReactNode } from "react";
import { ToastProvider } from "@/components/ToastProvider";
import ClientRoot from "./client-root";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ClientRoot>
        {children}
      </ClientRoot>
    </ToastProvider>
  );
}
