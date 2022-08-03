import { AxiosError } from 'axios'
import type { GetServerSideProps, NextPage } from 'next'

import { Heading } from '@chakra-ui/react'

import { getApi } from '../lib/api'

type CurrentUserData = {
  id: string
  name: string
  email: string
}

const Home: NextPage<{ currentUser?: CurrentUserData }> = ({ currentUser }) => {
  console.log(currentUser)

  return <Heading>Hello world on K8s</Heading>
}

const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { data } = await getApi(ctx).get<CurrentUserData>(
      '/api/users/current',
    )

    return {
      props: { currentUser: data },
    }
  } catch (err) {
    console.error('[ERROR]', (err as AxiosError).message)

    return {
      props: {},
    }
  }
}

export { getServerSideProps }
export default Home
