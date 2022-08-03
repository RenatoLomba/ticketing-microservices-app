import axios, { AxiosRequestHeaders } from 'axios'
import { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'

export const getApi = (ctx?: GetServerSidePropsContext) => {
  const cookies = nookies.get(ctx)
  const accessToken = cookies['@ticketing-dev:access_token:1.0.0']

  let headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${accessToken}`,
  }

  const isServerSide = typeof window === 'undefined'

  if (isServerSide && ctx) {
    headers = {
      ...(ctx?.req.headers as AxiosRequestHeaders),
      ...headers,
    }
  }

  return axios.create({
    baseURL: isServerSide
      ? 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local'
      : '',
    headers,
  })
}
