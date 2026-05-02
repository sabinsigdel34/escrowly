import React from "react";

export function AppShell({ children }) {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

