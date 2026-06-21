import { useAuthStore } from "@/store/auth";
import { BrandDashboard } from "./BrandDashboard";
import { CreatorDashboard } from "./CreatorDashboard";

export function DashboardPage() {
  const { user } = useAuthStore();
  if (!user) return null;
  return user.role === "BRAND" ? <BrandDashboard /> : <CreatorDashboard />;
}
