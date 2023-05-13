import axios from "axios";
import { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/authTokenErrror";

let isRefreshing = false;
let failRequestsQueue: {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError<unknown, any>) => void;
}[] = [];

export const setUpAuthAPiClient = (
  ctx = undefined
) => {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["nextAuth.token"]}`,
    },
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (error.response.data?.code === "token.expired") {
          cookies = parseCookies(ctx);
          const { "nextAuth.refreshToken": refreshToken } = cookies;
          const originalConfig = error.config as any;

          if (!isRefreshing) {
            isRefreshing = true;
            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;

                setCookie(ctx, "nextAuth.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                });

                setCookie(
                  ctx,
                  "nextAuth.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: "/",
                  }
                );

                api.defaults.headers["Authorization"] = `Bearer ${token}`;
                failRequestsQueue.forEach((request) =>
                  request.onSuccess(token)
                );
                failRequestsQueue = [];
              })
              .catch((error) => {
                failRequestsQueue.forEach((request) =>
                  request.onFailure(error)
                );
                failRequestsQueue = [];

                if (typeof window !== 'undefined') {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }
          return new Promise((resolve, reject) => {
            failRequestsQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;
                resolve(api(originalConfig));
              },
              onFailure: (error: AxiosError) => {
                reject(error);
              },
            });
          });
        } else {
          if (typeof window !== 'undefined') {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError())
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};
