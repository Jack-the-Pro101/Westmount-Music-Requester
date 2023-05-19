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
  // base.searchParams.set("client_secret", clientSecret);
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
  return getOauthUrl(process.env.GOOGLE_CLIENT_ID!, "http://localhost:3000/api/auth/google-redirect", ["email", "profile"], token);
}
