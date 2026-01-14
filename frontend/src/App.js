import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Datasets } from "./pages/Datasets";
import { Models } from "./pages/Models";
import { Experiments } from "./pages/Experiments";
import { Training } from "./pages/Training";
import { Results } from "./pages/Results";

function App() {
  return (
    <div className="App dark min-h-screen bg-background text-foreground">
      <BrowserRouter>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/datasets" element={<Datasets />} />
              <Route path="/models" element={<Models />} />
              <Route path="/experiments" element={<Experiments />} />
              <Route path="/training" element={<Training />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default App;
