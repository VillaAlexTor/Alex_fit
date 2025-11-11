/* Alex_fit/src/pages/Register.jsx */
import { supabase } from "../utils/supabaseClient";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

    export default function Register() {
        const [loading, setLoading] = useState(false);
        const [errorMsg, setErrorMsg] = useState("");
        const navigate = useNavigate();

        const handleOAuthLogin = async (provider) => {
            setLoading(true);
            setErrorMsg("");

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin + "/home",
                },
            });

            if (error) {
                console.error("Error de OAuth:", error);
                setErrorMsg("Error al iniciar sesión con " + provider);
            }

            setLoading(false);
        };

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-green-50">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Inicia sesión para continuar
                    </h2>

                    {errorMsg && (
                        <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-sm">
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleOAuthLogin("google")}
                            disabled={loading}
                            className="bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:opacity-60"
                        >
                            {loading ? "Cargando..." : "Continuar con Google"}
                        </button>

                        <button
                            onClick={() => handleOAuthLogin("facebook")}
                            disabled={loading}
                            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Cargando..." : "Continuar con Facebook"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
