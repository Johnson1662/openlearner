function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fullFenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fullFenceMatch) {
    return fullFenceMatch[1].trim();
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

function normalizeCandidate(text: string): string {
  const noBom = text.replace(/^\uFEFF/, '').trim();
  const withoutLeadingJsonToken = noBom.replace(/^json\s*(?=[{[])/i, '');
  return withoutLeadingJsonToken.trim();
}

function extractFirstBalancedJson(text: string): string | null {
  const source = text.trim();
  let start = -1;
  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (let index = 0; index < source.length; index++) {
    const char = source[index];

    if (start === -1) {
      if (char === '{' || char === '[') {
        start = index;
        stack.push(char);
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      stack.push(char);
      continue;
    }

    if (char === '}' || char === ']') {
      const expectedOpen = char === '}' ? '{' : '[';
      const currentOpen = stack[stack.length - 1];
      if (currentOpen !== expectedOpen) {
        break;
      }

      stack.pop();
      if (stack.length === 0 && start !== -1) {
        return source.slice(start, index + 1);
      }
    }
  }

  return null;
}

function addCandidate(candidates: string[], seen: Set<string>, value: string | null): void {
  if (!value) {
    return;
  }

  const normalized = normalizeCandidate(value);
  if (!normalized || seen.has(normalized)) {
    return;
  }

  candidates.push(normalized);
  seen.add(normalized);
}

function parseWithRepair<T>(candidate: string): T {
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const repaired = candidate.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(repaired) as T;
  }
}

export function parseAiJson<T>(content: string): T {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const trimmed = content.trim();
  const unfenced = stripCodeFence(trimmed);
  const extractedFromTrimmed = extractFirstBalancedJson(trimmed);
  const extractedFromUnfenced = extractFirstBalancedJson(unfenced);
  const fenceRemovedEverywhere = trimmed.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  addCandidate(candidates, seen, trimmed);
  addCandidate(candidates, seen, unfenced);
  addCandidate(candidates, seen, extractedFromTrimmed);
  addCandidate(candidates, seen, extractedFromUnfenced);
  addCandidate(candidates, seen, fenceRemovedEverywhere);

  let lastErrorMessage = 'Unknown parse error';

  for (const candidate of candidates) {
    try {
      return parseWithRepair<T>(candidate);
    } catch (error) {
      lastErrorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  throw new Error(`Failed to parse AI response: ${lastErrorMessage}`);
}
