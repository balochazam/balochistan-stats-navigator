
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useSimpleAuth";
import { PublicLanding } from "./pages/PublicLanding";
import { PublicReportView } from "./pages/PublicReportView";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { AdminLoginPage } from "./components/auth/AdminLoginPage";
import NotFound from "./pages/NotFound";
import { UserManagement } from "./pages/admin/UserManagement";
import { DepartmentManagement } from "./pages/admin/DepartmentManagement";
import { DataBankManagement } from "./pages/admin/DataBankManagement";
import { FormManagement } from "./pages/admin/FormManagement";
import { ScheduleManagement } from "./pages/admin/ScheduleManagement";
import { DataCollection } from "./pages/DataCollection";
import { Reports } from "./pages/Reports";
import { TechnologyTransfer } from "./pages/admin/TechnologyTransfer";
import { SDGDashboard } from "./pages/SDGDashboard";
import { SDGManagement } from "./pages/admin/SDGManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLanding />} />
            <Route path="/public/reports/:scheduleId" element={<PublicReportView />} />
            
            {/* Admin Authentication */}
            <Route path="/auth" element={<AdminLoginPage />} />
            
            {/* Protected Admin Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sdg-dashboard" element={<SDGDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/data-collection" element={<DataCollection />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/departments" element={<DepartmentManagement />} />
            <Route path="/admin/data-banks" element={<DataBankManagement />} />
            <Route path="/admin/forms" element={<FormManagement />} />
            <Route path="/admin/schedules" element={<ScheduleManagement />} />
            <Route path="/admin/sdg-management" element={<SDGManagement />} />
            <Route path="/admin/technology-transfer" element={<TechnologyTransfer />} />
            <Route path="/reports" element={<Reports />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
