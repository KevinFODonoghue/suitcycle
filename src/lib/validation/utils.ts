import type { ZodTypeAny, ZodError, output } from "zod";

export type ValidationFailure = {
  error: string;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

export function parseWithZod<T extends ZodTypeAny>(
  schema: T,
  data: unknown,
): { success: true; data: output<T> } | { success: false; details: ValidationFailure } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      details: formatZodError(result.error),
    };
  }
  return { success: true, data: result.data };
}

export function formatZodError(error: ZodError): ValidationFailure {
  const flattened = error.flatten();
  return {
    error: "Invalid input. Please review the highlighted fields.",
    fieldErrors: flattened.fieldErrors,
    formErrors: flattened.formErrors,
  };
}
