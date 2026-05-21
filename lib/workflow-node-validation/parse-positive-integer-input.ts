export function parsePositiveIntegerInput(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  if (!/^\d+$/.test(value.trim())) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}
