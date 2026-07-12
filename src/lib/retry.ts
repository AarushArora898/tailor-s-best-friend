type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  onRetry?: (attempt: number) => void;
};

const NETWORK_ERROR_PATTERNS = [
  "failed to fetch",
  "networkerror",
  "load failed",
  "fetch failed",
  "network request failed",
  "timeout",
];

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function isNetworkError(err: unknown) {
  const message = String((err as { message?: unknown })?.message ?? err).toLowerCase();
  return NETWORK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const retries = options.retries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 700;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isNetworkError(err) || attempt === retries) break;
      options.onRetry?.(attempt + 1);
      await wait(baseDelayMs * Math.max(1, attempt + 1));
    }
  }

  throw lastError;
}

export function getFriendlyErrorMessage(err: unknown) {
  if (isNetworkError(err)) {
    return "The backend is waking up or your network is unstable. Please wait a few seconds and try again.";
  }
  return String((err as { message?: unknown })?.message ?? "Something went wrong");
}

export function isInvalidCredentialsError(err: unknown) {
  return String((err as { message?: unknown })?.message ?? err).toLowerCase().includes("invalid login credentials");
}