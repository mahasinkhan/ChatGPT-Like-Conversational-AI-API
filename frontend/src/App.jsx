import React from 'react'
import AppRoutes from './routes/AppRoute'
import { UserProvider } from './context/user.context'

const App = () => {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}

export default App