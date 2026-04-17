declare module "@/env.mjs" {
  export const clientEnvOnly: typeof import("../src/env.mjs")["clientEnvOnly"];
  export const serverEnvOnly: typeof import("../src/env.mjs")["serverEnvOnly"];
  export const env: typeof import("../src/env.mjs")["env"];
}
