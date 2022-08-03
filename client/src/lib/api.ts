import axios, { AxiosRequestHeaders } from 'axios'
import { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'

export const getApi = (ctx?: GetServerSidePropsContext) => {
  const cookies = nookies.get(ctx)
  const accessToken = cookies['@ticketing-dev:access_token:1.0.0']

  const headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${accessToken}`,
  }

  const isServerSide = typeof window === 'undefined'

  if (isServerSide) {
    headers.Host = 'ticketing.dev'
  }

  return axios.create({
    baseURL: isServerSide
      ? 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local'
      : '',
    headers,
  })
}
