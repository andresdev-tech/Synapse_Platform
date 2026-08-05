import { AuthGuard } from '../../components/AuthGuard';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <aside className="flex-shrink-0 h-screen overflow-y-auto sticky top-0">
          <Sidebar />
        </aside>
        <main className="flex-1 h-screen overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}