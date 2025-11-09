/* Alex_fit/src/pages/Register.jsx */
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
    const [successMsg, setSuccessMsg] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

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
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    nombre: nombre
                },
                emailRedirectTo: window.location.origin
            }
        });

        setLoading(false);

        if (error) {
            setErrorMsg(traducirError(error.message));
            return;
        }

        // Verificar si necesita confirmación de email
        if (data?.user && !data?.session) {
            setSuccessMsg('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.');
            setTimeout(() => navigate("/login"), 3000);
        } else if (data?.session) {
            // Login automático exitoso (confirmación desactivada)
            setSuccessMsg('¡Cuenta creada exitosamente!');
            // El AuthContext manejará la redirección
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-green-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4 text-center">Crea tu cuenta</h2>

                {errorMsg && (
                    <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-sm">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <input 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                        type="text" 
                        placeholder="Nombre" 
                        className="border rounded p-2" 
                        required
                    />
                    <input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        type="email" 
                        placeholder="Correo" 
                        className="border rounded p-2" 
                        required 
                    />
                    <input 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        type="password" 
                        placeholder="Contraseña (mínimo 6 caracteres)" 
                        className="border rounded p-2" 
                        required 
                    />
                    <button 
                        disabled={loading} 
                        className="bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
                    >
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