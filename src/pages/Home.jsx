import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { supabase } from "../utils/supabaseClient";

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
            <div className="max-w-4xl mx-auto p-6 text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
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
                            <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Iniciar con correo</Link>
                            <button onClick={handleFacebookSignIn} className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors">Iniciar con Facebook</button>
                            <Link to="/register" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">Crear cuenta</Link>
                            <button onClick={() => setShowDemo(true)} className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">Ver demo</button>
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
