// Alex_fit/src/utils/calculos.js
// Calcular Tasa Metabólica Basal (TMB)
export const calcularTMB = (peso, altura, edad, genero) => {
  if (genero === 'masculino') {
    return 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad)
  } else {
    return 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad)
  }
}

// Calcular necesidades calóricas diarias
export const calcularCaloriasDiarias = (tmb, nivelActividad) => {
  const factoresActividad = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
    muyActivo: 1.9
  }
  return tmb * factoresActividad[nivelActividad]
}

// Calcular macronutrientes
export const calcularMacros = (caloriasObjetivo, objetivo) => {
  let proteinas, grasas, carbohidratos

  switch (objetivo) {
    case 'perdida':
      proteinas = (caloriasObjetivo * 0.4) / 4  // 40% proteínas
      grasas = (caloriasObjetivo * 0.35) / 9    // 35% grasas
      carbohidratos = (caloriasObjetivo * 0.25) / 4  // 25% carbohidratos
      break
    case 'mantenimiento':
      proteinas = (caloriasObjetivo * 0.3) / 4  // 30% proteínas
      grasas = (caloriasObjetivo * 0.3) / 9     // 30% grasas
      carbohidratos = (caloriasObjetivo * 0.4) / 4  // 40% carbohidratos
      break
    case 'ganancia':
      proteinas = (caloriasObjetivo * 0.25) / 4  // 25% proteínas
      grasas = (caloriasObjetivo * 0.25) / 9     // 25% grasas
      carbohidratos = (caloriasObjetivo * 0.5) / 4  // 50% carbohidratos
      break
    default:
      proteinas = (caloriasObjetivo * 0.3) / 4
      grasas = (caloriasObjetivo * 0.3) / 9
      carbohidratos = (caloriasObjetivo * 0.4) / 4
  }

  return {
    proteinas: Math.round(proteinas),
    grasas: Math.round(grasas),
    carbohidratos: Math.round(carbohidratos)
  }
}