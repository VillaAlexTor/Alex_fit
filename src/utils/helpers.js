// Alex_fit/src/utils/helpers.js
// Formatear fecha a formato local
export const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Formatear peso (añadir kg)
export const formatearPeso = (peso) => {
  return `${peso} kg`
}

// Formatear calorías
export const formatearCalorias = (calorias) => {
  return `${calorias} kcal`
}

// Validar email
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Generar color aleatorio para gráficos
export const generarColorAleatorio = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16)
}

// Calcular progreso
export const calcularProgreso = (inicial, actual, objetivo) => {
  if (objetivo > inicial) {
    // Para ganancia
    return Math.min(((actual - inicial) / (objetivo - inicial)) * 100, 100)
  } else {
    // Para pérdida
    return Math.min(((inicial - actual) / (inicial - objetivo)) * 100, 100)
  }
}

// Traducir mensajes de error comunes (Supabase / validación) a español
export const traducirError = (msg) => {
  if (!msg) return ''
  const m = msg.toLowerCase()
  if (m.includes('password should be at least') || (m.includes('length') && m.includes('password'))) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  if (m.includes('invalid login credentials') || (m.includes('invalid') && m.includes('password'))) {
    return 'Credenciales inválidas. Revisa tu correo y contraseña.'
  }
  if (m.includes('user already registered') || m.includes('user already exists')) {
    return 'El usuario ya está registrado. Intenta iniciar sesión.'
  }
  if (m.includes('invalid email') || (m.includes('invalid') && m.includes('email'))) {
    return 'Correo electrónico inválido.'
  }
  if (m.includes('duplicate') && m.includes('email')) {
    return 'Ya existe una cuenta con ese correo.'
  }
  // Mensaje por defecto: devolver el original
  return msg
}