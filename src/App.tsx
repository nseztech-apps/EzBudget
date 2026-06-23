import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { WizardPage } from './pages/WizardPage';
import { ReportPage } from './pages/ReportPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auditoria" element={<WizardPage />} />
        <Route path="/relatorio" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
