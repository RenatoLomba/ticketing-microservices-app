import type { NextPage } from 'next'

import { Heading } from '@chakra-ui/react'

import { useAuth, withAuth } from './_app'

const Home: NextPage = () => {
  const { user } = useAuth()

  if (!user) {
    return <Heading>User is not signed</Heading>
  }

  return <Heading>Welcome, {user.name}</Heading>
}

const getServerSideProps = withAuth(async (ctx) => {
  return {
    props: {},
  }
})

export { getServerSideProps }
export default Home
