// Generates a UUID-like identifier with graceful fallbacks for envs without crypto.randomUUID.
export const generateId = (): string => {
  const cryptoRef =
    typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  if (cryptoRef?.randomUUID) {
    return cryptoRef.randomUUID();
  }

  if (cryptoRef?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoRef.getRandomValues(bytes);

    const byte6 = bytes[6];
    const byte8 = bytes[8];
    if (byte6 !== undefined) {
      bytes[6] = (byte6 & 0x0f) | 0x40;
    }
    if (byte8 !== undefined) {
      bytes[8] = (byte8 & 0x3f) | 0x80;
    }

    const toHex = (value: number) => value.toString(16).padStart(2, "0");
    const hex = Array.from(bytes, toHex).join("");

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `id-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
};
