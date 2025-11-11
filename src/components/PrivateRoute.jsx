// Alex_fit/src/components/ProtectedRoute.jsx
import React, { useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { supabase } from "../utils/supabaseClient";

export default function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext);
    const location = useLocation();
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

    // Usuario no autenticado
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

    // Usuario nuevo, no completó registro
    if (user && !datosUsuario && location.pathname !== "/registro-datos") {
        return <Navigate to="/registro-datos" replace />;
    }

    // Usuario ya registrado
    return children;
}
