import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* You can add more routes later like /dashboard/?page_type=campaign */}
      </Routes>
    </Router>
  );
}

export default App;
