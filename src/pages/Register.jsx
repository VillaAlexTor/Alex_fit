import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { traducirError, validarEmail } from "../utils/helpers";

export default function Register() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        // Validaciones cliente
        if (!validarEmail(email)) {
            setLoading(false);
            setErrorMsg('El correo no tiene un formato válido.');
            return;
        }

        if (password.length < 6) {
            setLoading(false);
            setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        // Crear usuario con Supabase
        const { data, error } = await supabase.auth.signUp({ email, password });

        setLoading(false);

        if (error) {
            setErrorMsg(traducirError(error.message));
            return;
        }

        // Si la signUp devuelve sesión automática, redirigimos; si no, redirigimos a login
        // Intentamos loguear directamente para darle acceso inmediato
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) {
            navigate("/app/");
        } else {
            // Si requiere confirmación por email, llevar a login con mensaje
            setErrorMsg('Registro completado. Revisa tu correo para confirmar la cuenta.');
            navigate("/login");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-green-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4 text-center">Crea tu cuenta</h2>

                {errorMsg && (
                    <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{errorMsg}</div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" placeholder="Nombre" className="border rounded p-2" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Correo" className="border rounded p-2" required />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" className="border rounded p-2" required />
                    <button disabled={loading} className="bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60">
                        {loading ? "Creando..." : "Registrarse"}
                    </button>
                </form>

                <p className="text-sm mt-4 text-center">
                    ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 hover:underline">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}
