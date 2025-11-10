// Alex_fit/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        const checkUserAndData = async () => {
            setLoading(true);
            
            // Obtener sesión inicial
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                
                // Verificar si el usuario ya tiene datos guardados
                const { data: userData, error } = await supabase
                    .from("usuarios")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (!error && userData) {
                    setUserData(userData);
                } else {
                    setUserData(null);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            
            setLoading(false);
        };

        checkUserAndData();

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('Auth state changed:', event, session?.user?.email);

            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                
                // Verificar datos del usuario después del login
                const { data: userData } = await supabase
                    .from("usuarios")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (userData) {
                    setUserData(userData);
                    // Solo redirigir si NO está en una ruta del dashboard
                    if (!location.pathname.startsWith('/app')) {
                        navigate("/app/nutricion");
                    }
                } else {
                    setUserData(null);
                    // Solo redirigir si NO está ya en registro-datos
                    if (location.pathname !== '/registro-datos') {
                        navigate("/registro-datos");
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setUserData(null);
                // Solo redirigir a home si está en rutas protegidas
                if (location.pathname.startsWith('/app') || location.pathname === '/registro-datos') {
                    navigate("/");
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [navigate, location.pathname]);

    // Mostrar loading solo al inicio
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            userData, 
            loading,
            refreshUserData: async () => {
                if (user) {
                    const { data: userData } = await supabase
                        .from("usuarios")
                        .select("*")
                        .eq("id", user.id)
                        .single();
                    setUserData(userData);
                }
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};