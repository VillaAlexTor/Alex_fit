/* Alex_fit/src/components/LayoutDashboard.jsx */
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Overview from "../pages/Dashboard/Overview";
import Rutina from "../pages/Dashboard/Rutina";
import Nutricion from "../pages/Dashboard/Nutricion";
import Progreso from "../pages/Dashboard/Progreso";
import Perfil from "../pages/Dashboard/Perfil";

export default function DashboardLayout() {
    return (
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
}