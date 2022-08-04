import { AxiosError } from 'axios'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { createContext, FC, ReactNode, useContext, useState } from 'react'

import { ChakraProvider, extendTheme, useToast } from '@chakra-ui/react'
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { Header } from '../components/header'
import { getApi } from '../lib/api'
import {
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../utils/cookies'
import {
  handleErrorMessage,
  ResponseErrorData,
} from '../utils/handle-error-message'

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

// export const queryClient = new QueryClient()

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
  signOut: () => Promise<void>
}

const AuthContext = createContext({} as AuthContextData)

type AuthProviderProps = {
  children: ReactNode
  initialUser?: User
}

const AuthProvider: FC<AuthProviderProps> = ({ children, initialUser }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast({
    duration: 9000,
    isClosable: true,
    position: 'top-right',
  })

  const { data: user } = useQuery(
    ['current-user'],
    async () => {
      const response = await getApi().get<User>('/api/users/current')

      return response.data
    },
    { initialData: initialUser, retry: false, staleTime: 1000 * 60 * 15 },
  )

  const { mutateAsync: signOut } = useMutation(
    async () => {
      await getApi().post('/api/users/signout')
    },
    {
      onSuccess() {
        removeAccessToken()
        removeRefreshToken()

        router.reload()
      },
      onError(error: AxiosError<ResponseErrorData>) {
        handleErrorMessage(error, (errorData) => {
          toast({
            title: errorData.error,
            description: errorData.message,
            status: 'error',
          })
        })
      },
    },
  )

  function sign({
    user,
    access_token: accessToken,
    refresh_token: refreshToken,
  }: AuthenticationData) {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)

    queryClient.setQueryData<User>(['current-user'], user)
  }

  return (
    <AuthContext.Provider value={{ user, sign, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={defaultTheme}>
        <Hydrate state={pageProps.dehydratedState}>
          <AuthProvider initialUser={pageProps.currentUser}>
            <Header />
            <Component {...pageProps} />
          </AuthProvider>
        </Hydrate>
      </ChakraProvider>
    </QueryClientProvider>
  )
}

export default MyApp
