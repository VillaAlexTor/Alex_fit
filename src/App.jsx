// Alex_fit/src/App.jsx
import React, { useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import './styles/tailwind.css';
import './styles/globals.css';
import Home from "./pages/Home";
import Overview from "./pages/Dashboard/Overview";
import Rutina from "./pages/Dashboard/Rutina";
import Nutricion from "./pages/Dashboard/Nutricion";
import Progreso from "./pages/Dashboard/Progreso";
import Perfil from "./pages/Dashboard/Perfil";
import NotFound from "./pages/NotFound";
import RegistroDatos from "./pages/RegistroDatos";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { AuthContext } from "./context/AuthContext.jsx";
import { supabase } from "./utils/supabaseClient";

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
        const { user } = useContext(AuthContext);
        const [datosUsuario, setDatosUsuario] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (user) {
            const fetchDatos = async () => {
                const { data, error } = await supabase
                .from("usuarios")
                .select("*")
                .eq("id", user.id)
                .single();
                if (!error) setDatosUsuario(data);
                setLoading(false);
            };
            fetchDatos();
            } else {
            setLoading(false);
            }
        }, [user]);

        if (loading) return <p>Cargando...</p>;

        // Redirección automática según estado del usuario
        if (!user) return <Navigate to="/login" replace />;
        if (user && !datosUsuario) return <Navigate to="/registro-datos" replace />;
        if (user && datosUsuario) return <Navigate to="/app/nutricion" replace />;

        return (
            <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/registro-datos" element={<ProtectedRoute><RegistroDatos /></ProtectedRoute>} />
            <Route path="/app/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
            </Routes>
        );
    }
