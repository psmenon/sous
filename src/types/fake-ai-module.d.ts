// "@fake-ai" is resolved by next.config.mjs to fake-ai.off.ts (normal builds) or fake-ai.ts (local test builds).
declare module "@fake-ai" {
  export const fakeAI: { adapt: () => string; ask: (hasPhoto: boolean) => string } | null;
}
