
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
import { SDGManagement } from "./pages/admin/SDGManagement";
import { IndicatorDashboardWrapper } from "./pages/IndicatorDashboardWrapper";
import GoalDetailPage from "./pages/GoalDetailPage";
import { IndicatorDetailsPage } from "./pages/IndicatorDetailsPage";
import { Toaster as HotToaster } from 'react-hot-toast';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as [string];
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicLanding />} />
            <Route path="/public/reports/:scheduleId" element={<PublicReportView />} />
            <Route path="/auth" element={<AdminLoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/data-collection" element={<DataCollection />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/departments" element={<DepartmentManagement />} />
            <Route path="/admin/data-banks" element={<DataBankManagement />} />
            <Route path="/admin/forms" element={<FormManagement />} />
            <Route path="/admin/schedules" element={<ScheduleManagement />} />
            <Route path="/admin/sdg-management" element={<SDGManagement />} />
            <Route path="/goals/:goalId" element={<GoalDetailPage />} />
            <Route path="/indicators/:id" element={<IndicatorDetailsPage />} />
            <Route path="/indicator/:indicatorCode" element={<IndicatorDashboardWrapper />} />
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
