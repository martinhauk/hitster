type ProbeValidationContext = {
  candidate: string;
  requestPath: string;
  response: Response;
  method: "HEAD" | "GET";
};

/**
 * Attempts to resolve each provided public filename by issuing HEAD requests.
 * Returns the normalized filenames that responded with a 2xx/3xx status.
 */
export async function findExistingPublicFiles(
  candidateFilenames: string[]
): Promise<string[]> {
  if (!candidateFilenames.length) {
    return [];
  }

  const method = "HEAD";

  const results = await Promise.all(
    candidateFilenames.map(async (rawCandidate) => {
      const normalizedCandidate = normalizeCandidate(rawCandidate);
      if (!normalizedCandidate) {
        return null;
      }

      const requestPath = `/${normalizedCandidate}`;
      try {
        const response = await fetch(requestPath, {
          method,
          cache: "no-store",
          redirect: "follow",
        });
        const context: ProbeValidationContext = {
          candidate: normalizedCandidate,
          requestPath,
          response,
          method,
        };
        return defaultResponseValidator(context) ? normalizedCandidate : null;
      } catch {
        return null;
      }
    })
  );

  return results.filter((value): value is string => Boolean(value));
}

function normalizeCandidate(candidate: string): string {
  const trimmed = candidate.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
}

function defaultResponseValidator({
  response,
}: ProbeValidationContext): boolean {
  if (!response.ok) {
    return false;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType) {
    return true;
  }

  return !contentType.toLowerCase().includes("text/html");
}
