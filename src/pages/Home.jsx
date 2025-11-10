/* Alex_fit/src/pages/Home.jsx */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabaseClient";

const handleOAuthLogin = async (provider) => {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const baseUrl = isGitHubPages 
        ? 'https://villaalextor.github.io/Alex_fit/'
        : window.location.origin + '/';
    
    await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: baseUrl
        }
    });
};

export default function Home() {
    const { user, userData } = useAuth();
    const navigate = useNavigate();

    // Estados para la demo interactiva
    const [showDemo, setShowDemo] = useState(false);
    const [demoProgress, setDemoProgress] = useState(46);
    const [demoCalories, setDemoCalories] = useState(450);
    const [activeFeature, setActiveFeature] = useState(0);

    const addDemoFood = (cals = 100) => {
        setDemoCalories(prev => prev + cals);
        setDemoProgress(p => Math.min(100, p + Math.round(cals / 20)));
    };

    // Animación de features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: "📊",
            title: "Calculadora inteligente",
            desc: "Calorías y macros precisos"
        },
        {
            icon: "🍎",
            title: "Registro diario",
            desc: "Seguimiento de comidas"
        },
        {
            icon: "💪",
            title: "Rutinas personalizadas",
            desc: "Ejercicios con seguimiento"
        },
        {
            icon: "📈",
            title: "Gráficas avanzadas",
            desc: "Progreso visual"
        }
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleEmpezar = () => {
        if (userData) {
            // Si ya tiene datos, ir al dashboard
            navigate("/app/nutricion");
        } else {
            // Si no tiene datos, ir a registro de datos
            navigate("/registro-datos");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900 text-white overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10 animate-pulse delay-500"></div>
            </div>

            {/* Header con usuario */}
            {user && (
                <div className="relative z-10 container mx-auto px-4 pt-6">
                    <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center text-lg font-bold">
                                {user.email[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-white">{user.email}</p>
                                <p className="text-sm text-gray-400">
                                    {userData ? 'Perfil completado' : 'Completa tu perfil'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative z-10 container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                            <span className="text-sm text-emerald-300">Tu salud, bajo control</span>
                        </div>
                        
                        <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight text-white">
                            {user ? (
                                <>
                                    ¡Bienvenido de vuelta,
                                    <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"> {user.email.split('@')[0]}</span>!
                                </>
                            ) : (
                                <>
                                    Transforma tu 
                                    <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"> salud</span>
                                    <br />
                                    con inteligencia
                                </>
                            )}
                        </h1>
                        
                        <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                            {user 
                                ? "Continúa tu viaje hacia una vida más saludable. Tus metas te esperan."
                                : "Planifica tus comidas, optimiza tu rutina y alcanza tus metas con nuestra plataforma todo-en-uno diseñada para resultados reales."
                            }
                        </p>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl">
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className={`p-4 rounded-xl border transition-all duration-500 cursor-pointer ${
                                        activeFeature === index 
                                            ? 'bg-white/10 border-emerald-400/50 shadow-lg shadow-emerald-500/20' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                    onMouseEnter={() => setActiveFeature(index)}
                                >
                                    <div className="text-2xl mb-2">{feature.icon}</div>
                                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                                    <p className="text-sm text-gray-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Auth Buttons - Condicionalmente */}
                        {user ? (
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <button 
                                    onClick={handleEmpezar}
                                    className="group relative bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {userData ? '🚀 Ir al Dashboard' : '✨ Empezar ahora'}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                                
                                <button 
                                    onClick={() => setShowDemo(true)} 
                                    className="group relative bg-gradient-to-r from-gray-700 to-gray-800 text-white px-8 py-5 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-600"
                                >
                                    <span className="flex items-center gap-2">
                                        🎬 Ver demo
                                    </span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <Link 
                                    to="/login" 
                                    className="group relative bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                                >
                                    <span className="relative z-10">Iniciar con correo</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                                
                                <button 
                                    onClick={() => handleOAuthLogin('facebook')} 
                                    className="group relative bg-[#1877F2] text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-3"
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span>Facebook</span>
                                </button>
                                
                                <button 
                                    onClick={() => handleOAuthLogin('google')} 
                                    className="group relative bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 border border-gray-200"
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    <span>Google</span>
                                </button>
                                
                                <button 
                                    onClick={() => setShowDemo(true)} 
                                    className="group relative bg-gradient-to-r from-gray-700 to-gray-800 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-600"
                                >
                                    <span className="flex items-center gap-2">
                                        🎬 Ver demo interactiva
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Demo Card */}
                    <div className="w-full lg:w-96">
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                                <h3 className="font-bold text-lg text-white">Panel de Progreso</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>Progreso diario</span>
                                        <span>{demoProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-emerald-400 to-blue-400 h-3 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${demoProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => setDemoProgress(p => Math.min(100, p + 5))}
                                        className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl py-2 transition-all duration-300 hover:scale-105"
                                    >
                                        +5%
                                    </button>
                                    <button 
                                        onClick={() => setDemoProgress(p => Math.max(0, p - 5))}
                                        className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl py-2 transition-all duration-300 hover:scale-105"
                                    >
                                        -5%
                                    </button>
                                    <button 
                                        onClick={() => setDemoProgress(46)}
                                        className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl py-2 transition-all duration-300 hover:scale-105"
                                    >
                                        Reset
                                    </button>
                                </div>
                                
                                <div className="pt-4 border-t border-gray-700">
                                    <p className="text-sm text-gray-400">
                                        Añade tus comidas y ejercicios para obtener un plan personalizado. 
                                        <span className="text-emerald-400"> ¡Comienza hoy!</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Modal */}
            {showDemo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full p-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                                Demo Interactiva
                            </h3>
                            <button 
                                onClick={() => setShowDemo(false)} 
                                className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full transition-colors duration-200"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-gray-400 mb-6">
                            Experimenta cómo funciona nuestra plataforma. Añade comidas de ejemplo y observa los cambios en tiempo real.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-700/50 rounded-2xl p-5 border border-gray-600">
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                    <span className="text-yellow-400">🍽️</span> Comidas de Ejemplo
                                </h4>
                                <div className="flex gap-2 mb-4">
                                    <button 
                                        onClick={() => addDemoFood(250)}
                                        className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-xl py-3 transition-all duration-300 hover:scale-105"
                                    >
                                        +250 kcal
                                    </button>
                                    <button 
                                        onClick={() => addDemoFood(500)}
                                        className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl py-3 transition-all duration-300 hover:scale-105"
                                    >
                                        +500 kcal
                                    </button>
                                </div>
                                <div className="text-center p-3 bg-gray-600/50 rounded-xl">
                                    <div className="text-2xl font-bold text-white">{demoCalories} kcal</div>
                                    <div className="text-sm text-gray-400">Total consumido</div>
                                </div>
                            </div>

                            <div className="bg-gray-700/50 rounded-2xl p-5 border border-gray-600">
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                    <span className="text-emerald-400">📈</span> Tu Progreso
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">Meta: 2000 kcal</span>
                                            <span className="text-emerald-400">{Math.round((demoCalories/2000)*100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-600 rounded-full h-3">
                                            <div 
                                                className="bg-gradient-to-r from-emerald-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, (demoCalories/2000)*100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {setDemoCalories(0); setDemoProgress(46);}}
                                        className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl py-3 transition-all duration-300"
                                    >
                                        Reiniciar Demo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );    
}