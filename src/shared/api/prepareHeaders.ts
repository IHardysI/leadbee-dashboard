import base64 from 'base-64';
import { GetServerSidePropsContext } from 'next';
import nookies from 'nookies';
import { AxiosHeaders } from 'axios';

const BASIC_AUTH_LOGIN = process.env.NEXT_PUBLIC_BASIC_AUTH_LOGIN;
const BASIC_AUTH_PASSWORD = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;

const baseHeaders = new Headers();
baseHeaders.set('Content-Type', 'application/json');
baseHeaders.set('Accept', 'application/json');

if (BASIC_AUTH_LOGIN && BASIC_AUTH_PASSWORD) {
  baseHeaders.set(
    'Authorization',
    `Basic ${base64.encode(`${BASIC_AUTH_LOGIN}:${BASIC_AUTH_PASSWORD}`)}`
  );
}

export const baseAxiosHeaders = new AxiosHeaders();

baseHeaders.forEach((value, key) => {
  baseAxiosHeaders.set(key, value, true);
});

export const prepareHeaders = (headers: Headers) => {
  baseHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  // if (token && withToken) headers.set('Authorization', `Bearer ${token}`);

  return headers;
};

export const prepareSSRAxiosHeaders = (context: GetServerSidePropsContext) => {
  const origReqHeaders = context.req.headers;
  const origCookie = origReqHeaders.cookie;
  const parsedCookie = nookies.get(context);
  const token = parsedCookie?.BITRIX_SM_JWT as string | undefined;

  const headers = new AxiosHeaders();

  baseHeaders.forEach((value, key) => {
    headers.set(key, value, true);
  });

  if (origCookie) {
    headers.set('cookie', origCookie, true);
  }

  if (token) {
    headers.set('Authorization-Token', token, true);
  }

  return headers;
};
