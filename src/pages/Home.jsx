import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { supabase } from "../utils/supabaseClient";

    const handleOAuthLogin = async (provider) => {
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin + '/app'
            }
        });
    };

    export default function Home() {
        const { user } = useContext(AuthContext);
        const navigate = useNavigate();

        // Estados para la demo interactiva
        const [showDemo, setShowDemo] = useState(false);
        const [demoProgress, setDemoProgress] = useState(46);
        const [demoCalories, setDemoCalories] = useState(450);

        const addDemoFood = (cals = 100) => {
            setDemoCalories(prev => prev + cals);
            // aumentar progreso proporcionalmente (ej: 1% por 20 kcal)
            setDemoProgress(p => Math.min(100, p + Math.round(cals / 20)));
        };

        // Si el usuario ya inició sesión, redirigir automáticamente
        useEffect(() => {
            if (user) {
                navigate("/app/nutricion");
            }
        }, [user, navigate]);

        const handleFacebookSignIn = async () => {
            await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: window.location.origin + '/app'
                }
            });
        };

        return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-green-900 text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="flex-1">
                        <h1 className="text-4xl font-extrabold mb-3 text-green-700">Recupera el control de tu salud</h1>
                        <p className="text-lg text-gray-700 mb-4">Planifica tus comidas, sigue tu rutina y mide tu progreso en un solo lugar.</p>

                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            <li className="bg-gray-50 p-3 rounded">Calculadora de calorías y macros</li>
                            <li className="bg-gray-50 p-3 rounded">Registro diario de comidas</li>
                            <li className="bg-gray-50 p-3 rounded">Rutinas con seguimiento</li>
                            <li className="bg-gray-50 p-3 rounded">Gráficas de progreso</li>
                        </ul>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                Iniciar con correo
                            </Link>
                            <button 
                                onClick={() => handleOAuthLogin('facebook')} 
                                className="bg-[#1877F2] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Iniciar con Facebook
                            </button>
                            <button 
                                onClick={() => handleOAuthLogin('google')} 
                                className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Iniciar con Google
                            </button>
                            <Link to="/register" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                                Crear cuenta
                            </Link>
                            <button onClick={() => setShowDemo(true)} className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                                Ver demo
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-80 bg-gradient-to-br from-green-100 to-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold mb-2">Resumen rápido</h3>
                        <p className="text-sm text-gray-600">Añade tus comidas y ejercicios para obtener un plan personalizado. Mantén un seguimiento fácil de tu progreso.</p>
                        <div className="mt-4">
                            <div className="text-sm text-gray-500">Sigue tu progreso</div>
                            <div className="w-full bg-gray-200 rounded h-2 mt-2">
                                <div className="bg-green-500 h-2 rounded" style={{ width: demoProgress + '%'}} />
                            </div>
                            <div className="mt-3 flex gap-2">
                                <button onClick={() => setDemoProgress(p => Math.min(100, p + 5))} className="text-sm bg-green-600 text-white px-3 py-1 rounded">+5%</button>
                                <button onClick={() => setDemoProgress(p => Math.max(0, p - 5))} className="text-sm bg-gray-200 px-3 py-1 rounded">-5%</button>
                                <button onClick={() => setDemoProgress(46)} className="text-sm underline text-gray-600">Reset</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 text-gray-500">
                <p>
                Después de iniciar sesión, podrás acceder a tu perfil personalizado 
                donde verás tus objetivos diarios, progreso y registros de comidas y ejercicios.
                </p>
            </div>

            {/* Demo modal */}
            {showDemo && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Demo rápido</h3>
                            <button onClick={() => setShowDemo(false)} className="text-gray-600">Cerrar ✕</button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">Prueba de interacción: añade calorías de ejemplo y observa cómo cambian las barras.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded">
                                <h4 className="font-semibold mb-2">Agregar comida de ejemplo</h4>
                                <div className="flex gap-2">
                                    <button onClick={() => addDemoFood(250)} className="bg-yellow-400 px-3 py-1 rounded">+250 kcal</button>
                                    <button onClick={() => addDemoFood(500)} className="bg-yellow-500 text-white px-3 py-1 rounded">+500 kcal</button>
                                    <button onClick={() => addDemoFood(100)} className="bg-yellow-200 px-3 py-1 rounded">+100 kcal</button>
                                </div>
                                <div className="mt-4">Total demo calorías: <strong>{demoCalories} kcal</strong></div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded">
                                <h4 className="font-semibold mb-2">Progreso demo</h4>
                                <div className="mb-2">Calorías: {demoCalories} / 2000</div>
                                <div className="w-full bg-gray-200 rounded h-3">
                                    <div className="bg-green-500 h-3 rounded" style={{ width: Math.min(100, (demoCalories/2000)*100) + '%' }} />
                                </div>
                                <div className="mt-3 text-sm text-gray-500">Puedes resetear la demo o seguir añadiendo comidas.</div>
                                <div className="mt-3 flex gap-2">
                                    <button onClick={() => setDemoCalories(0)} className="bg-red-500 text-white px-3 py-1 rounded">Reset demo</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            </div>
        );    
    }
