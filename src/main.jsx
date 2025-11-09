// Alex_fit/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthProvider from "./context/AuthContext.jsx";
// Tailwind y estilos globales
import "./styles/tailwind.css";
import "./styles/globals.css";

    ReactDOM.createRoot(document.getElementById("app")).render(
        <React.StrictMode>
            <AuthProvider>
            <App />
            </AuthProvider>
        </React.StrictMode>
    );