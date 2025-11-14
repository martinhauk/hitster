import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ConfigPage, PlayerPage, WtfPage } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/wtf" replace />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/wtf" element={<WtfPage />} />
        <Route path="/player/:fileName" element={<PlayerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
