/* Alex_fit/src/pages/Dashboard.jsx */
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

    export default function Dashboard() {
        const { user } = useContext(AuthContext);

        return (
            <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Bienvenido, {user?.email}</h1>
            <p>Tu ID de usuario es: {user?.id}</p>
            </div>
        );
    }
