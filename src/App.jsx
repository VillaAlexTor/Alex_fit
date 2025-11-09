// Alex_fit/src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import './styles/tailwind.css';
import './styles/globals.css';
import Home from "./pages/Home";

// Pages
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

// Dashboard Layout Component
    const DashboardLayout = () => (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex flex-col flex-1">
            <Navbar />
            <main className="flex-1 p-6">
                <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="rutina" element={<Rutina />} />
                <Route path="nutricion" element={<Nutricion />} />
                <Route path="progreso" element={<Progreso />} />
                <Route path="perfil" element={<Perfil />} />
                </Routes>
            </main>
            </div>
        </div>
    );

    export default function App() {
        return (
            <Router>
            <Routes>
                {/* Rutas públicas (sin layout de dashboard) */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/registro-datos" element={<RegistroDatos />} />

                {/* Rutas con layout de dashboard (mount en /app/*) */}
                <Route path="/app/*" element={<DashboardLayout />} />

                {/* Ruta 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            </Router>
        );
    }