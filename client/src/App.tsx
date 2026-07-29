import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navbar, Footer, ScrollToTop } from "@/components/layout";
import { SplashScreen } from "@/components/shared";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import AlgorithmsPage from "@/pages/AlgorithmsPage";
import AlgorithmPage from "@/pages/AlgorithmPage";
import HousePage from "@/pages/HousePage";

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const isHomePage = location.pathname === "/";

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
              <Route path="/house/:houseSlug" element={<HousePage />} />
            </Routes>
          </main>
          <Footer />
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
