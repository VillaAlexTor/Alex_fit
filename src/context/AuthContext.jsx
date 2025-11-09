// Alex_fit/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                    // Si ya tiene datos, redirigir al dashboard
                    if (window.location.pathname === '/registro-datos') {
                        navigate("/app/nutricion");
                    }
                } else {
                    // Si no tiene datos, redirigir al registro de datos
                    if (window.location.pathname !== '/registro-datos') {
                        navigate("/registro-datos");
                    }
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

            if (session?.user) {
                setUser(session.user);
                
                // Verificar datos del usuario después del login
                const { data: userData } = await supabase
                    .from("usuarios")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (userData) {
                    setUserData(userData);
                    // Si ya tiene datos y está en registro-datos, redirigir al dashboard
                    if (window.location.pathname === '/registro-datos') {
                        navigate("/app/nutricion");
                    }
                } else {
                    // Si no tiene datos, redirigir al registro
                    setUserData(null);
                    navigate("/registro-datos");
                }
            } else {
                setUser(null);
                setUserData(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [navigate]);

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