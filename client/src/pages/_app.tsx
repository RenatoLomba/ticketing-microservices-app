import type { AppProps } from 'next/app'
import { createContext, FC, ReactNode, useContext, useState } from 'react'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { setAccessToken, setRefreshToken } from '../utils/cookies'

const defaultTheme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.800',
        color: 'gray.100',
      },
    },
  },
})

export const queryClient = new QueryClient()

type User = {
  id: string
  name: string
  email: string
}

type AuthenticationData = {
  access_token: string
  refresh_token: string
  user: User
}

type AuthContextData = {
  user?: User
  sign: (data: AuthenticationData) => void
}

const AuthContext = createContext({} as AuthContextData)

type AuthProviderProps = {
  children: ReactNode
  initialUser?: User
}

const AuthProvider: FC<AuthProviderProps> = ({ children, initialUser }) => {
  const [user, setUser] = useState(initialUser)

  function sign({
    user,
    access_token: accessToken,
    refresh_token: refreshToken,
  }: AuthenticationData) {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    setUser(user)
  }

  return (
    <AuthContext.Provider value={{ user, sign }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={defaultTheme}>
        <AuthProvider initialUser={pageProps.currentUser}>
          <Component {...pageProps} />
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  )
}

export default MyApp
