import { sign } from "jsonwebtoken";

export function validateAllParams(params: unknown[]) {
  return params.every((param) => param != null);
}

const illegalRe = /[\/\?<>\\:\*\|"]/g;
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const windowsTrailingRe = /[\. ]+$/;

export function sanitizeFilename(input: string, replacement: string) {
  const sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
  return sanitized.slice(0, 255);
}

export function getOauthUrl(clientId: string, redirectUri: string, scopes: string[], state: string) {
  const base = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  base.searchParams.set("client_id", clientId);
  base.searchParams.set("redirect_uri", redirectUri);
  base.searchParams.set("scope", scopes.join(" "));
  base.searchParams.set("state", state);
  base.searchParams.set("access_type", "offline");
  base.searchParams.set("prompt", ["select_account", "consent"].join(" "));
  base.searchParams.set("response_type", "code");
  return base.toString();
}

// Gets an OAuth url from current env and parameters.
export function getCurrentOauthUrl() {
  const token = sign({ expires: Date.now() + 3600000 }, process.env.JWT_SECRET!);
  return getOauthUrl(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.NODE_ENV === "production"
      ? process.env.GOOGLE_REDIRECT_URI!
      : "http://localhost:3000/api/auth/google-redirect",
    ["email", "profile"],
    token
  );
}

export async function getAccessToken(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<string | undefined> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const json = await response.json();

    return json.access_token as string;
  } catch {}
}

interface GoogleRawProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

export async function getUserProfile(accessToken: string): Promise<GoogleRawProfile | undefined> {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const json: GoogleRawProfile = await response.json();
    return json;
  } catch {}
}
