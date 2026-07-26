import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navbar, Footer, ScrollToTop } from "@/components/layout";
import { SplashScreen } from "@/components/shared";
import HomePage from "@/pages/HomePage";
import AlgorithmsPage from "@/pages/AlgorithmsPage";
import AlgorithmPage from "@/pages/AlgorithmPage";
import HousePage from "@/pages/HousePage";

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-surface w-full">
      <SplashScreen />
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
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

