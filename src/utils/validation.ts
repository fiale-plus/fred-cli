const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateDate(value: string, name: string): void {
  if (!DATE_RE.test(value)) {
    throw new Error(`Invalid ${name}: "${value}". Expected YYYY-MM-DD format.`);
  }
}

export function validatePositiveInt(value: string, name: string, max?: number): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`Invalid ${name}: "${value}". Expected a positive integer.`);
  }
  if (max !== undefined && n > max) {
    throw new Error(`Invalid ${name}: ${n} exceeds maximum of ${max}.`);
  }
  return n;
}

export function resolveApiKey(flagValue?: string): string {
  const key = flagValue || process.env.FRED_API_KEY;
  if (!key) {
    throw new Error(
      "No API key provided. Set FRED_API_KEY environment variable or use --api-key flag.\n" +
        "Get a free key at: https://fred.stlouisfed.org/docs/api/api_key.html",
    );
  }
  return key;
}
