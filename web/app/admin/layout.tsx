import { AdminGate } from "@/components/admin/AdminGate";
import { AdminTabs } from "@/components/admin/AdminTabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <AdminTabs />
      {children}
    </AdminGate>
  );
}
