import { GetServerSidePropsContext } from 'next'
import nookies from 'nookies'

export enum CookiesNames {
  ACCESS_TOKEN = '@ticketing-dev:access_token:1.0.0',
  REFRESH_TOKEN = '@ticketing-dev:refresh_token:1.0.0',
}

export function setAccessToken(
  accessToken: string,
  ctx?: GetServerSidePropsContext,
) {
  nookies.set(ctx, CookiesNames.ACCESS_TOKEN, accessToken, {
    maxAge: 60 * 60 * 24,
    path: '/',
  })
}

export function setRefreshToken(
  refreshToken: string,
  ctx?: GetServerSidePropsContext,
) {
  nookies.set(ctx, CookiesNames.REFRESH_TOKEN, refreshToken, {
    maxAge: 60 * 60 * 24,
    path: '/',
  })
}
