import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import WorkPage from './pages/WorkPage';
import ContactPage from './pages/ContactPage';
import SoundManager from './utils/SoundManager';
import CustomCursor from './components/CustomCursor';

function App() {
  return (
    <Router future={{ v7_startTransition: true }}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-dark overflow-x-hidden">
        <CustomCursor />
        <div className="w-full max-w-[1140px] p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
          <Navigation />
        </div>
      </div>
    </Router>
  );
}

export default App;