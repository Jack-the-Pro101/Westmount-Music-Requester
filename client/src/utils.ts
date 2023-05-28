export async function fetchRetry(retryAmount: number, input: RequestInfo | URL, init: RequestInit | undefined) {
  for (let i = 0; i < retryAmount; i++) {
    const request = await fetch(input, init).catch(() => {});
    if (!request || !request.ok) continue;
    return request;
  }
}

export function secondsToHumanReadableString(seconds: number) {
  const sliceRange = seconds > 60 * 60 ? [11, 19] : [14, 19];

  const time = new Date(seconds * 1000).toISOString().slice(...sliceRange);

  if (seconds >= 60) return time.replace(/^[0:]+/, "");
  return time;
}

export function anyStringIncludes(strings: string[], filter: string) {
  if (!filter) return true;
  return strings.some((string) => string.replace(/ /g, "").toLowerCase().includes(filter.toLowerCase().replace(/ /g, "")));
}

export function HttpStatusToString(status: number) {
  switch (status) {
    case 401:
      return "Username or password invalid.";
    case 403:
      return "You do not have permissions to access this resource.";
    case 429:
      return "You are sending requests too quickly!";
    case 500:
      return "An unexpected error occurred on the server!";
  }
}
