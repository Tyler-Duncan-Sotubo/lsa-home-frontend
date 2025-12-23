// src/shared/utils/create-stable-key.ts
export function createStableKey(
  ...parts: Array<string | number | null | undefined>
): string {
  return parts
    .map((p) =>
      p === null ? "null" : p === undefined ? "undefined" : String(p)
    )
    .join("__");
}
