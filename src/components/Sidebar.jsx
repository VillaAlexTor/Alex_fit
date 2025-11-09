/* Alex_fit/src/components/Sidebar.jsx */
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Dumbbell, Apple, BarChart2, User } from "lucide-react";

export default function Sidebar() {
    const links = [
        { to: "/app/", label: "Inicio", icon: <Home size={20} /> },
        { to: "/app/rutina", label: "Rutina", icon: <Dumbbell size={20} /> },
        { to: "/app/nutricion", label: "Nutrición", icon: <Apple size={20} /> },
        { to: "/app/progreso", label: "Progreso", icon: <BarChart2 size={20} /> },
        { to: "/app/perfil", label: "Perfil", icon: <User size={20} /> },
    ];

    return (
        <aside className="w-64 bg-white shadow-lg">
            <div className="p-6 text-2xl font-bold text-green-600">Alex_Fit</div>
            <nav className="flex flex-col p-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 p-2 rounded-md hover:bg-green-100 ${
                                isActive ? "bg-green-200 font-semibold" : ""
                            }`
                        }
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}