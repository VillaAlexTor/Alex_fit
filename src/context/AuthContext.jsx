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

        const initAuth = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
            setUser(session.user);
            await createUserIfNotExists(session.user);
        } else {
            setUser(null);
            setUserData(null);
        }

        setLoading(false);
        };

        initAuth();

        // Suscripción a cambios de sesión
        const { data: listener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.email);
            if (session?.user) {
            setUser(session.user);
            await createUserIfNotExists(session.user);
            } else {
            setUser(null);
            setUserData(null);
            }
        }
        );

        return () => {
        mounted = false;
        listener.subscription.unsubscribe();
        };
    }, []);

    const createUserIfNotExists = async (supabaseUser) => {
        try {
        const { data: existing } = await supabase
            .from("usuarios")
            .select("*")
            .eq("auth_id", supabaseUser.id)
            .single();

        if (!existing) {
            const { data: newUser, error } = await supabase
            .from("usuarios")
            .insert([
                {
                auth_id: supabaseUser.id,
                email: supabaseUser.email,
                nombre:
                    supabaseUser.user_metadata.full_name ||
                    supabaseUser.user_metadata.name ||
                    "",
                created_at: new Date(),
                },
            ])
            .select()
            .single();

            if (error) throw error;
            setUserData(newUser);
        } else {
            setUserData(existing);
        }
        } catch (e) {
        console.error("Error creando usuario:", e.message);
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
        <AuthContext.Provider value={{ user, userData, loading }}>
        {children}
        </AuthContext.Provider>
    );
    }

    export const useAuth = () => useContext(AuthContext);
