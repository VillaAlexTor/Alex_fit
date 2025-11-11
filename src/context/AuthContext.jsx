// Alex_fit/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabaseClient";

export const AuthContext = createContext();

    export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🔹 Inicializa sesión al cargar
        const initAuth = async () => {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session?.user) {
            setUser(session.user);
            await crearUsuarioSiNoExiste(session.user);
        } else {
            setUser(null);
            setUserData(null);
        }

        setLoading(false);
        };

        initAuth();

        // 🔹 Escucha cambios en el estado de autenticación
        const { data: listener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.email);
            if (session?.user) {
            setUser(session.user);
            await crearUsuarioSiNoExiste(session.user);
            } else {
            setUser(null);
            setUserData(null);
            }
        }
        );

        return () => {
        listener.subscription.unsubscribe();
        };
    }, []);

    // ✅ Crea o actualiza el usuario si no existe
    const crearUsuarioSiNoExiste = async (supabaseUser) => {
        try {
            // 🔹 Intentamos crear/actualizar el usuario directamente
            console.log("Creando o actualizando usuario en la tabla usuarios...");
            const { data, error } = await supabase
            .from("usuarios")
            .upsert(
                {
                auth_id: supabaseUser.id,
                email: supabaseUser.email,
                nombre: supabaseUser.user_metadata?.full_name || "",
                created_at: new Date(),
                },
                { onConflict: ["auth_id"], ignoreDuplicates: false }
            )
            .select()
            .single();

            if (error) throw error;
            setUserData(data);
        } catch (error) {
            console.error("Error creando usuario:", error.message);

            // 🔹 Para desarrollo, podemos hacer fallback usando service_role si falla RLS
            /*
            const { data } = await supabase
            .from("usuarios")
            .upsert(
                {
                auth_id: supabaseUser.id,
                email: supabaseUser.email,
                nombre: supabaseUser.user_metadata?.full_name || "",
                created_at: new Date(),
                },
                { onConflict: ["auth_id"] }
            )
            .select()
            .single({ schema: "public" }); // solo si se usa servicio
            setUserData(data);
            */
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

    // Hook para usar en cualquier componente
    export const useAuth = () => useContext(AuthContext);
