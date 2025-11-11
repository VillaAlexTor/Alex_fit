// Alex_fit/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import './styles/tailwind.css';
import './styles/globals.css';
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import RegistroDatos from "./pages/RegistroDatos";
import DashboardLayout from "./components/LayoutDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />

            {/* Registro de datos (protegido) */}
            <Route
                path="/registro-datos"
                element={
                    <ProtectedRoute>
                        <RegistroDatos />
                    </ProtectedRoute>
                }
            />

            {/* Dashboard y rutas internas (protegidas) */}
            <Route
                path="/app/*"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            />

            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
