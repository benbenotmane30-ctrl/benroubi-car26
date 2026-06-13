import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* TODO Phase 4 : ajouter les pages /catalogue, /contact, etc. */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
