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
