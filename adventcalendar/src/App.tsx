import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigPage, PlayerPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/config" replace />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/player" element={<PlayerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
