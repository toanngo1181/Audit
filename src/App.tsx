import React, { useState } from "react";
import { View } from "./types";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import AuditPage from "./pages/AuditPage";
import { useChecklist } from "./hooks/useChecklist";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const { 
    checklist, 
    session, 
    updateItem, 
    loading, 
    error, 
    refresh 
  } = useChecklist();

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <DashboardPage />;
      case View.ADMIN:
        return <AdminPage />;
      case View.AUDIT:
      default:
        return (
          <AuditPage
            checklist={checklist}
            session={session}
            updateItem={updateItem}
            loading={loading}
            error={error}
            refresh={refresh}
            onPhotoUpload={() => Promise.resolve()} 
          />
        );
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;