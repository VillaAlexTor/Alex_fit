// Alex_fit/src/components/ProtectedRoute.jsx
import React, { useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { supabase } from "../utils/supabaseClient";

    export default function ProtectedRoute({ children }) {
        const { user } = useContext(AuthContext);
        const location = useLocation();
        const [loading, setLoading] = useState(true);
        const [userData, setUserData] = useState(null);

        useEffect(() => {
            const checkUserData = async () => {
            if (user) {
                try {
                console.log("🔍 ProtectedRoute - Checking user data for:", user.id);
                
                const { data, error } = await supabase
                    .from("usuarios")
                    .select("formulario_completo")
                    .eq("auth_id", user.id)
                    .single();

                if (error) {
                    console.error("Error fetching user data:", error);
                } else {
                    console.log("✅ User data found - formulario_completo:", data?.formulario_completo);
                    setUserData(data);
                }
                } catch (error) {
                console.error("Error in ProtectedRoute:", error);
                }
            }
            setLoading(false);
            };

            checkUserData();
        }, [user, location.pathname]); // ← Cambié location por location.pathname

        if (loading) {
            return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-gray-300">Verificando...</p>
                </div>
            </div>
            );
        }

        // 🔹 DEBUG: Mostrar estado actual
        console.log("🔄 ProtectedRoute State:", {
            hasUser: !!user,
            hasUserData: !!userData,
            formularioCompleto: userData?.formulario_completo,
            currentPath: location.pathname
        });

        // 🔹 Usuario no autenticado → Home
        if (!user) {
            console.log("🚫 No user, redirecting to home");
            return <Navigate to="/" replace />;
        }

        // 🔹 Usuario autenticado pero sin formulario → RegistroDatos
        if (user && (!userData || userData.formulario_completo === false)) {
            if (location.pathname !== "/registro-datos") {
            console.log("📝 User needs form, redirecting to registro-datos");
            return <Navigate to="/registro-datos" replace />;
            }
        }

        // 🔹 Usuario con formulario completo intentando acceder a registro → Dashboard
        if (user && userData?.formulario_completo === true && location.pathname === "/registro-datos") {
            console.log("✅ Form completed, redirecting to dashboard");
            return <Navigate to="/app/nutricion" replace />;
        }

        console.log("🎯 Allowing access to:", location.pathname);
        return children;
    }