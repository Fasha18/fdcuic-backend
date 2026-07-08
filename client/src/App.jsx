import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DetailAppel from './pages/DetailAppel';
import CandidaturesList from './pages/CandidaturesList';
import Profile from './pages/Profile';
import AdminLayout from './components/AdminLayout';

import AdminBrouillons from './components/admin/AdminBrouillons';
import AdminCandidature from './components/admin/AdminCandidature';
import AdminSoumissionnaires from './components/admin/AdminSoumissionnaires';
import AdminPersonnel from './components/admin/AdminPersonnel';
import AdminTypesProjet from './components/admin/AdminTypesProjet';
import AdminSecteurs from './components/admin/AdminSecteurs';
import AdminFinances from './components/admin/AdminFinances';
import AdminNotifications from './components/admin/AdminNotifications';
import AdminFAQs from './components/admin/AdminFAQs';
import AdminLegal from './components/admin/AdminLegal';
import AdminDetailDossier from './components/admin/AdminDetailDossier';
import AdminDetailSoumissionnaire from './components/admin/AdminDetailSoumissionnaire';
import AdminDetailMobilite from './components/admin/AdminDetailMobilite';

import CandidatDashboardNew from './pages/CandidatDashboardNew';
import CandidatAppels from './pages/CandidatAppels';
import CandidatMobilite from './pages/CandidatMobilite';
import CandidatDetailAppel from './pages/CandidatDetailAppel';
import CandidatCandidature from './pages/CandidatCandidature';
import CandidatConfirmation from './pages/CandidatConfirmation';
import CandidatMesDossiers from './pages/CandidatMesDossiers';
import CandidatMobiliteFormulaire from './pages/CandidatMobiliteFormulaire';
import CandidatRessources from './pages/CandidatRessources';

function App() {
  const [connecte, setConnecte] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { return JSON.parse(userStr).role; } catch (e) { return null; }
    }
    return null;
  });
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { setUserRole(JSON.parse(userStr).role); } catch (e) { setUserRole(null); }
    } else {
      setUserRole(null);
    }
  }, []);

  const handleLogin = (role) => {
    setConnecte(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setConnecte(false);
    setUserRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!connecte ? <Login onLogin={handleLogin} /> : <Navigate to={['admin', 'evaluateur'].includes(userRole) ? '/admin' : '/candidat'} replace />} 
        />

        {connecte ? (
          <>
            {['admin', 'evaluateur'].includes(userRole) && (
              <Route path="/admin" element={<AdminLayout onLogout={handleLogout} />}>
                {/* Routes gérées par Dashboard (qui agira comme composant principal) */}
                <Route index element={<Dashboard activeTab="apercu" onLogout={handleLogout} />} />
                <Route path="appels" element={<Dashboard activeTab="campagnes" onLogout={handleLogout} />} />
                <Route path="mobilite" element={<Dashboard activeTab="mobilite" onLogout={handleLogout} />} />
                
                {/* Pages dédiées (remplaçant les anciens composants dans Dashboard) */}
                <Route path="brouillons" element={<AdminBrouillons />} />
                <Route path="candidatures-admin" element={<AdminCandidature />} />
                <Route path="soumissionnaires" element={<AdminSoumissionnaires />} />
                <Route path="personnel" element={<AdminPersonnel />} />
                <Route path="types-projet" element={<AdminTypesProjet />} />
                <Route path="secteurs" element={<AdminSecteurs />} />
                <Route path="finances" element={<AdminFinances />} />
                <Route path="notifications-admin" element={<AdminNotifications />} />
                <Route path="faqs" element={<AdminFAQs />} />
                <Route path="legal" element={<AdminLegal />} />
                <Route path="profil" element={<Profile onLogout={handleLogout} />} />
                
                {/* Routes de détails spécifiques (sans Dashboard wrapper) */}
                <Route path="appels/:id" element={<DetailAppel onLogout={handleLogout} />} />
                <Route path="appels/:id/candidatures" element={<CandidaturesList onLogout={handleLogout} type="appel" />} />
                <Route path="mobilite/candidatures" element={<CandidaturesList onLogout={handleLogout} type="mobilite" />} />
                {/* Détail d'un dossier (accessible admin + évaluateur) */}
                <Route path="dossiers/:id" element={<AdminDetailDossier onLogout={handleLogout} />} />
                <Route path="soumissionnaires/:id" element={<AdminDetailSoumissionnaire />} />
                <Route path="mobilite/candidature/:id" element={<AdminDetailMobilite onLogout={handleLogout} />} />
              </Route>
            )}

            {userRole === 'candidat' && (
              <>
                <Route path="/candidat" element={<CandidatDashboardNew onLogout={handleLogout} />} />
                <Route path="/candidat/profil" element={<Profile onLogout={handleLogout} />} />
                <Route path="/candidat/appels" element={<CandidatAppels onLogout={handleLogout} />} />
                <Route path="/candidat/appels/:id" element={<CandidatDetailAppel onLogout={handleLogout} />} />
                <Route path="/candidat/appels/:id/candidature" element={<CandidatCandidature onLogout={handleLogout} />} />
                <Route path="/candidat/confirmation/:id" element={<CandidatConfirmation onLogout={handleLogout} />} />
                <Route path="/candidat/mes-dossiers" element={<CandidatMesDossiers onLogout={handleLogout} />} />
                <Route path="/candidat/mobilite" element={<CandidatMobilite onLogout={handleLogout} />} />
                <Route path="/candidat/mobilite/candidature" element={<CandidatMobiliteFormulaire onLogout={handleLogout} />} />
                <Route path="/candidat/mobilite/nouveau" element={<CandidatMobiliteFormulaire onLogout={handleLogout} />} />
                <Route path="/candidat/ressources" element={<CandidatRessources onLogout={handleLogout} />} />
              </>
            )}

            <Route path="*" element={<Navigate to={['admin', 'evaluateur'].includes(userRole) ? '/admin' : '/candidat'} replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
