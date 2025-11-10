// Alex_fit/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabaseClient";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const checkUserAndData = async () => {
            setLoading(true);

            const { data: { session } } = await supabase.auth.getSession();

            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);

                await ensureUserData(session.user);
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

            console.log("Auth state changed:", event, session?.user?.email);

            if (session?.user) {
                setUser(session.user);
                await ensureUserData(session.user);
            } else {
                setUser(null);
                setUserData(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // 🧠 Función para verificar y crear datos si no existen
    const ensureUserData = async (supabaseUser) => {
        const { data: existingUser, error } = await supabase
            .from("usuarios")
            .select("*")
            .eq("auth_id", supabaseUser.id)
            .single();

        if (existingUser) {
            setUserData(existingUser);
        } else {
            console.warn("Usuario no encontrado en tabla 'usuarios', creando registro...");
            const { data: newUser, error: insertError } = await supabase
                .from("usuarios")
                .insert([
                    {
                        auth_id: supabaseUser.id,
                        email: supabaseUser.email,
                        nombre: "",
                        created_at: new Date(),
                    },
                ])
                .select()
                .single();

            if (!insertError) {
                setUserData(newUser);
            } else {
                console.error("Error al crear usuario:", insertError);
                setUserData(null);
            }
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                    <p className="text-gray-300">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                loading,
                refreshUserData: async () => {
                    if (user) {
                        const { data: updatedUserData } = await supabase
                            .from("usuarios")
                            .select("*")
                            .eq("auth_id", user.id)
                            .single();
                        setUserData(updatedUserData);
                    }
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};
