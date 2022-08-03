import axios, { AxiosError, AxiosRequestHeaders } from 'axios'
import { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'

import { setAccessToken } from '../utils/cookies'

type ResponseErrorData = {
  statusCode: number
  message: string
  error: string
}

export const getApi = (ctx?: GetServerSidePropsContext) => {
  const cookies = nookies.get(ctx)
  const accessToken = cookies['@ticketing-dev:access_token:1.0.0']

  let headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${accessToken}`,
  }

  const isServerSide = typeof window === 'undefined'

  if (isServerSide && ctx) {
    headers = {
      ...(ctx.req.headers as AxiosRequestHeaders),
      ...headers,
    }
  }

  const axiosInstance = axios.create({
    baseURL: isServerSide
      ? 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local'
      : '',
    headers,
  })

  axiosInstance.interceptors.response.use(
    function (response) {
      return response
    },
    async function (error: AxiosError<ResponseErrorData>) {
      if (error.config && error.response && error.response.status === 401) {
        if (error.response.data.message === 'jwt.expired') {
          const refreshToken = cookies['@ticketing-dev:refresh_token:1.0.0']

          if (refreshToken) {
            const { data } = await axiosInstance.post<{ access_token: string }>(
              '/api/users/refresh',
              {
                refresh_token: refreshToken,
              },
            )

            setAccessToken(data.access_token, ctx)
            axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
            error.config.headers!.Authorization = `Bearer ${data.access_token}`
            return axiosInstance.request(error.config)
          }
        }
      }

      return Promise.reject(error)
    },
  )

  return axiosInstance
}
