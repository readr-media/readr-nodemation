function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) {
    values.push(value);
  }
}

function parseDelimitedValues(input: string) {
  return input
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function expandNumericRange(token: string) {
  const match = token.match(/^(\d+)\s*-\s*(\d+)$/);

  if (!match) {
    return [token];
  }

  const start = Number.parseInt(match[1], 10);
  const end = Number.parseInt(match[2], 10);

  if (start > end) {
    return [token];
  }

  const expanded: string[] = [];

  for (let current = start; current <= end; current += 1) {
    expanded.push(String(current));
  }

  return expanded;
}

export function parseCmsPostIds(input: string) {
  const values: string[] = [];

  for (const token of parseDelimitedValues(input)) {
    for (const expanded of expandNumericRange(token)) {
      pushUnique(values, expanded);
    }
  }

  return values;
}

export function parseCmsPostSlugs(input: string) {
  const values: string[] = [];

  for (const token of parseDelimitedValues(input)) {
    pushUnique(values, token);
  }

  return values;
}
