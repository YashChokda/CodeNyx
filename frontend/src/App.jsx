import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import DomainSelect from './pages/DomainSelect';
import IdeaSubmit from './pages/IdeaSubmit';
import Decisions from './pages/Decisions';
import Simulation from './pages/Simulation';
import Feedback from './pages/Feedback';
import Advanced from './pages/Advanced';
import EcosystemMap from './pages/EcosystemMap';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <main className="min-h-screen pt-16">
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/domain" element={<DomainSelect />} />
            <Route path="/idea" element={<IdeaSubmit />} />
            <Route path="/decisions" element={<Decisions />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/advanced" element={<Advanced />} />
            <Route path="/ecosystem" element={<EcosystemMap />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AppProvider>
  );
}
