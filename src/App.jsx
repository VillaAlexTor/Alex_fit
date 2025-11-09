// Alex_fit/src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './styles/tailwind.css';
import './styles/globals.css';

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Overview from "./pages/Dashboard/Overview";
import Rutina from "./pages/Dashboard/Rutina";
import Nutricion from "./pages/Dashboard/Nutricion";
import Progreso from "./pages/Dashboard/Progreso";
import Perfil from "./pages/Dashboard/Perfil";
import NotFound from "./pages/NotFound";
import RegistroDatos from "./pages/RegistroDatos";

// Layout Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Context o hook de autenticación (debes implementarlo)
import { useAuth } from "./context/AuthContext";

// Componente para rutas protegidas
    const ProtectedRoute = ({ children }) => {
        const { isAuthenticated } = useAuth(); // Implementa este hook
        return isAuthenticated ? children : <Navigate to="/login" />;
    };

// Dashboard Layout Component
    const DashboardLayout = () => (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Navbar />
                <main className="flex-1 p-6">
                <Routes>
                    <Route index element={<Overview />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="rutina" element={<Rutina />} />
                    <Route path="nutricion" element={<Nutricion />} />
                    <Route path="progreso" element={<Progreso />} />
                    <Route path="perfil" element={<Perfil />} />
                    {/* Redirección por defecto */}
                    <Route path="*" element={<Navigate to="overview" replace />} />
                </Routes>
                </main>
            </div>
            </div>
        </ProtectedRoute>
    );

// Componente para rutas públicas (evitar acceso si ya está autenticado)
    const PublicRoute = ({ children }) => {
        const { isAuthenticated } = useAuth();
        return !isAuthenticated ? children : <Navigate to="/app/overview" />;
    };

    export default function App() {
        return (
            <Router>
            <Routes>
                {/* Ruta principal */}
                <Route path="/" element={<Home />} />
                
                {/* Rutas públicas (solo para usuarios no autenticados) */}
                <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
                } />
                <Route path="/register" element={
                <PublicRoute>
                    <Register />
                </PublicRoute>
                } />
                
                {/* Ruta de registro de datos (puede ser pública o protegida según tu lógica) */}
                <Route path="/registro-datos" element={<RegistroDatos />} />

                {/* Rutas protegidas del dashboard */}
                <Route path="/app/*" element={<DashboardLayout />} />

                {/* Ruta 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            </Router>
        );
    }