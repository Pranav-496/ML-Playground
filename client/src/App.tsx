import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar, Footer } from "@/components/layout";
import HomePage from "@/pages/HomePage";
import AlgorithmsPage from "@/pages/AlgorithmsPage";
import AlgorithmPage from "@/pages/AlgorithmPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/algorithms" element={<AlgorithmsPage />} />
            <Route path="/algorithms/:slug" element={<AlgorithmPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
