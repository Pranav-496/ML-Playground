import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navbar, Footer, ScrollToTop } from "@/components/layout";
import { SplashScreen } from "@/components/shared";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import AlgorithmsPage from "@/pages/AlgorithmsPage";
import AlgorithmPage from "@/pages/AlgorithmPage";
import CitadelPage from "@/pages/CitadelPage";
import CampaignPage from "@/pages/CampaignPage";
import HousePage from "@/pages/HousePage";
import ProfilePage from "@/pages/ProfilePage";
import BattleArenaPage from "@/pages/BattleArenaPage";
import IronThronePage from "@/pages/IronThronePage";
import RoyalArchivesPage from "@/pages/RoyalArchivesPage";
import AutoMlPage from "@/pages/AutoMlPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { useEffect } from "react";

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const isHomePage = location.pathname === "/";

  // Dynamic document title based on route
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Valoris — King's Landing",
      "/algorithms": "Valoris — The Great Houses",
      "/citadel": "Valoris — The Citadel",
      "/battle-arena": "Valoris — Battle Arena",
      "/iron-throne": "Valoris — Iron Throne",
      "/royal-archives": "Valoris — Royal Archives",
      "/automl": "Valoris — AutoML Vision",
      "/profile": "Valoris — Lord's Chambers",
    };
    
    // For dynamic routes, we do a basic prefix match or fallback
    let newTitle = "Valoris — Forge Intelligence";
    if (titles[location.pathname]) {
      newTitle = titles[location.pathname];
    } else if (location.pathname.startsWith("/house/")) {
      newTitle = `Valoris — House Details`;
    } else if (location.pathname.startsWith("/algorithms/")) {
      newTitle = `Valoris — Algorithm Champion`;
    } else if (location.pathname.startsWith("/citadel/")) {
      newTitle = `Valoris — Citadel Campaign`;
    }
    
    document.title = newTitle;
  }, [location.pathname]);

  // Show a blank screen while auth state is being validated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#B90E0A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface w-full">
      <SplashScreen />

      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <>
          <ScrollToTop />
          <Navbar />
          <main className={isHomePage ? "flex-1 w-full" : "flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full"}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/algorithms" element={<AlgorithmsPage />} />
              <Route path="/algorithms/:slug" element={<AlgorithmPage />} />
              <Route path="/citadel" element={<CitadelPage />} />
              <Route path="/citadel/:id" element={<CampaignPage />} />
              <Route path="/house/:houseSlug" element={<HousePage />} />
              <Route path="/battle-arena" element={<BattleArenaPage />} />
              <Route path="/iron-throne" element={<IronThronePage />} />
              <Route path="/royal-archives" element={<RoyalArchivesPage />} />
              <Route path="/automl" element={<AutoMlPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          {!isHomePage && <Footer />}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
