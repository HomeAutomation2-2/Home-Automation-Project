"use client";

import { MobileNav } from "@/components/shell/mobile-nav";
import { SessionBootstrap } from "@/components/shell/session-bootstrap";
import { SideNav } from "@/components/shell/side-nav";
import { TopAppBar } from "@/components/shell/top-app-bar";

/** Layout principal: sidebar fix 240px + conținut cu navbar Figma */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <SessionBootstrap />
      <SideNav />
      <div className="flex min-h-screen flex-col md:pl-[240px]">
        <MobileNav />
        <TopAppBar />
        <main className="flex-1 overflow-auto bg-[#faf8ff] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
