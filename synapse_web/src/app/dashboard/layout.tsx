'use client';
import { useState } from 'react';
import { AuthGuard } from '../../components/AuthGuard';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 h-screen overflow-y-auto bg-gray-50 lg:ml-0">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}