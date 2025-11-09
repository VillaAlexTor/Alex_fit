/* Alex_fit/src/components/Navbar.jsx */
import React from "react";
import { User } from "lucide-react";
    export default function Navbar() {
        return (
            <header className="flex justify-between items-center bg-white shadow-md px-6 py-3">
                <h1 className="text-xl font-bold text-green-600">Alex_Fit</h1>
                <div className="flex items-center space-x-3">
                    <div className="bg-green-600 text-white p-2 rounded-full">
                        <User size={20} />
                    </div>
                </div>
            </header>
        );
    }
