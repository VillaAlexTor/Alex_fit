import { createContext, useState, useContext } from 'react'

const DataContext = createContext({})

export const DataProvider = ({ children }) => {
  const [rutinas, setRutinas] = useState([])
  const [comidas, setComidas] = useState([])
  const [progreso, setProgreso] = useState([])

  return (
    <DataContext.Provider value={{ 
      rutinas, setRutinas,
      comidas, setComidas,
      progreso, setProgreso
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  return useContext(DataContext)
}