import {
  excerptAppearsInPage,
  normalizePageText,
  sourceHost,
  summarizeEvidence,
} from "./core.js";
import type { EvidenceSource, EvidenceSummary } from "./types.js";

const maxSourceBytes = 2_000_000;

export async function verifySources(
  sources: EvidenceSource[],
  options: { requireAttestedForm?: boolean } = {},
): Promise<{ sources: EvidenceSource[]; evidence: EvidenceSummary }> {
  const seenHosts = new Set<string>();
  const verified: EvidenceSource[] = [];

  for (const source of sources) {
    const result = { ...source, accessedAt: new Date().toISOString() };
    if (source.excerpt.length < 20 || source.excerpt.length > 500) {
      result.verificationError =
        "Evidence excerpts must contain between 20 and 500 characters.";
      verified.push(result);
      continue;
    }
    if (
      options.requireAttestedForm &&
      (!source.attestedForm ||
        !normalizePageText(source.excerpt).includes(
          normalizePageText(source.attestedForm),
        ))
    ) {
      result.verificationError =
        "The evidence excerpt does not contain its claimed attested idiom form.";
      verified.push(result);
      continue;
    }
    const host = sourceHost(source.url);
    if (!host) {
      result.verificationError = "Invalid source URL.";
      verified.push(result);
      continue;
    }
    if (seenHosts.has(host)) {
      result.verificationError = "Duplicate source publisher.";
      verified.push(result);
      continue;
    }
    seenHosts.add(host);

    try {
      const response = await fetch(source.url, {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
        headers: {
          "User-Agent":
            "IdiomaticallyResearchBot/1.0 (+https://idiomatically.net)",
        },
      });
      result.httpStatus = response.status;
      result.finalUrl = response.url;
      if (!response.ok) {
        result.verificationError = `Source returned HTTP ${response.status}.`;
      } else {
        const contentLength = Number(response.headers.get("content-length"));
        if (contentLength > maxSourceBytes) {
          result.verificationError = "Source page exceeded the size limit.";
        } else {
          const page = (await response.text()).slice(0, maxSourceBytes);
          result.excerptMatched = excerptAppearsInPage(source.excerpt, page);
          if (!result.excerptMatched) {
            result.verificationError =
              "The supplied evidence excerpt was not found on the page.";
          }
        }
      }
    } catch (error) {
      result.verificationError =
        error instanceof Error ? error.message : String(error);
    }
    verified.push(result);
  }

  return { sources: verified, evidence: summarizeEvidence(verified) };
}
