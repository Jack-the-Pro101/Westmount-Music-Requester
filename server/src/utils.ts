export function validateAllParams(params: any[]) {
  return !params.some((param) => param == null);
}
