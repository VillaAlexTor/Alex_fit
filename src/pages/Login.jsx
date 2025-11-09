import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { traducirError } from "../utils/helpers";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    const handleOAuthLogin = async (provider) => {
        setErrorMsg("");
        const { error } = await supabase.auth.signInWithOAuth({ provider });
        if (error) setErrorMsg(traducirError(error.message));
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);

        if (error) {
            setErrorMsg(traducirError(error.message));
            return;
        }

        // Redirect to app
        navigate("/app/");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-4 text-center">Iniciar sesión en Alex_Fit</h1>

                {errorMsg && (
                    <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{errorMsg}</div>
                )}

                <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border rounded p-2"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border rounded p-2"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Iniciando..." : "Iniciar con correo"}
                    </button>
                </form>

                <div className="my-4 border-t pt-4">
                    <p className="text-center text-sm text-gray-500 mb-3">O inicia sesión con</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => handleOAuthLogin("google")}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Google
                        </button>
                        <button
                            onClick={() => handleOAuthLogin("facebook")}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Facebook
                        </button>
                    </div>
                </div>

                <p className="text-sm text-center mt-4">
                    ¿No tienes cuenta? <Link to="/register" className="text-green-600 font-semibold">Crear cuenta</Link>
                </p>
            </div>
        </div>
    );
}
