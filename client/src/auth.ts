export const REFRESH_TOKEN_KEY = "refreshToken";
export const ACCESS_TOKEN_KEY = "accessToken";

interface JwtHeader {
  alg: string;
  typ: string;
}

interface JwtPayload {
  sub: string;
  name: string;
  expiry: number;
}

interface JsonWebToken {
  header: JwtHeader;
  payload: JwtPayload;
}

const isJwtHeader = (obj: any): obj is JwtHeader => {
  return ["alg", "typ"].every(el => el in obj);
};

const isJwtPayload = (obj: any): obj is JwtPayload => {
  return ["sub", "name", "expiry"].every(el => el in obj);
};

export const setAccessToken = (accessToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setRefreshToken = (refreshToken: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getAccessTokenDetails = (): JsonWebToken | null => {
  const accessToken = getAccessToken();

  if (accessToken == null) {
    return null;
  }

  const [header, payload, _signature] = accessToken.split('.');

  const decodedHeader = atob(header);
  const decodedPayload = atob(payload);

  const headerJson = JSON.parse(decodedHeader);
  const payloadJson = JSON.parse(decodedPayload);

  if (!isJwtHeader(headerJson)) {
    return null;
  }

  if (!isJwtPayload(payloadJson)) {
    return null;
  }

  return { header: headerJson, payload: payloadJson };
}

export const fetchAccessToken = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  const response = await fetch("/api/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken })
  });
  const responseBody = await response.json();
  return setAccessToken(responseBody.accessToken);
};

export const isLoggedIn = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  const accessTokenDetails = getAccessTokenDetails();

  if (refreshToken == null) {
    console.log("no refresh token")
    return Promise.resolve(false);
  }

  if (accessTokenDetails == null || accessTokenDetails.payload.expiry * 1000 < Date.now()) {
    try {
      await fetchAccessToken();
      console.log("logged in")
      return true;
    } catch (err) {
      console.log(`can't get new access token: ${err}`)
      return false;
    }
  }

  return Promise.resolve(true);
};

export const authFetch = async (url: string, request: RequestInit): Promise<Response> => {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return Promise.reject();
  }

  return fetch(url, {
    ...request,
    headers: {
      "Authorization": `Bearer ${getAccessToken()}`,
      ...request.headers
    },
  });
};
