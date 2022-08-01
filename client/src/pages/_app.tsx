import type { AppProps } from 'next/app'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'

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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={defaultTheme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
