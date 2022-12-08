export function validateAllParams(params: unknown[]) {
  return params.every((param) => param != null);
}
