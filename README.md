# Alex Fit

Aplicación web para el seguimiento de fitness y nutrición personal.

## Características

- Registro y seguimiento de rutinas de ejercicio
- Control de nutrición y calorías
- Seguimiento de progreso
- Gráficos de evolución
- Perfil personalizado

## Tecnologías

- React
- Vite
- Tailwind CSS
- Supabase
- React Router
- Chart.js

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   - Crear archivo `.env` con las credenciales de Supabase
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

```
Alex_Fit/
│
├── src/
│   ├── pages/           # Páginas principales
│   ├── components/      # Componentes reutilizables
│   ├── utils/          # Utilidades y helpers
│   ├── styles/         # Estilos globales
│   ├── context/        # Contextos de React
│   └── App.jsx         # Componente principal
│
└── public/             # Archivos estáticos
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build