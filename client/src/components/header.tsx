import NextLink from 'next/link'
import { FC } from 'react'

import { Box, Flex, Heading, HStack, Link } from '@chakra-ui/react'

import { useAuth } from '../pages/_app'

export const Header: FC = () => {
  const { user, signOut } = useAuth()

  return (
    <Box as="header" h="60px" bg="pink.500" w="100%">
      <Flex
        h="100%"
        maxWidth="720px"
        w="100%"
        mx="auto"
        align="center"
        justify="space-between"
      >
        <NextLink href="/" passHref>
          <Link>
            <Heading size="lg">GitTix</Heading>
          </Link>
        </NextLink>

        <HStack spacing={6}>
          {user ? (
            <Link onClick={signOut}>Sign Out</Link>
          ) : (
            <>
              <NextLink href="/auth/signin" passHref>
                <Link>Sign In</Link>
              </NextLink>
              <NextLink href="/auth/signup" passHref>
                <Link>Sign Up</Link>
              </NextLink>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}
