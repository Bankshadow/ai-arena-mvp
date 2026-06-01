import { z } from "zod";

export const submissionFormSchema = z.object({
  challengeSlug: z.string().min(1),
  displayName: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.string().trim().optional(),
  workflowNotes: z.string().trim().optional(),
  promptUsed: z.string().trim().min(10, "Prompt must be at least 10 characters."),
  modelUsed: z.string().trim().min(1, "Model is required."),
  estimatedCostUsd: z.coerce.number().min(0, "Cost cannot be negative."),
  output: z.string().trim().min(50, "Output must be at least 50 characters."),
});

export type SubmissionFormInput = z.infer<typeof submissionFormSchema>;

export type SubmissionFormFields = {
  name: string;
  email: string;
  promptUsed: string;
  modelUsed: string;
  estimatedCost: string;
  output: string;
};

export function formFieldsToInput(
  fields: SubmissionFormFields,
  challengeSlug: string
): Record<string, unknown> {
  return {
    challengeSlug,
    displayName: fields.name,
    email: fields.email,
    promptUsed: fields.promptUsed,
    modelUsed: fields.modelUsed,
    estimatedCostUsd: fields.estimatedCost,
    output: fields.output,
  };
}

export function zodErrorsToFieldErrors(
  error: z.ZodError
): Partial<Record<keyof SubmissionFormFields, string>> {
  const map: Partial<Record<keyof SubmissionFormFields, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "displayName") map.name = issue.message;
    else if (key === "estimatedCostUsd") map.estimatedCost = issue.message;
    else if (key === "challengeSlug") continue;
    else if (key === "email") map.email = issue.message;
    else if (key === "promptUsed") map.promptUsed = issue.message;
    else if (key === "modelUsed") map.modelUsed = issue.message;
    else if (key === "output") map.output = issue.message;
  }
  return map;
}

export function validateSubmissionForm(
  fields: SubmissionFormFields,
  challengeSlug: string,
  costLimitUsd: number
): {
  success: boolean;
  data?: SubmissionFormInput;
  fieldErrors?: Partial<Record<keyof SubmissionFormFields, string>>;
} {
  const parsed = submissionFormSchema.safeParse(formFieldsToInput(fields, challengeSlug));
  if (!parsed.success) {
    return { success: false, fieldErrors: zodErrorsToFieldErrors(parsed.error) };
  }
  if (parsed.data.estimatedCostUsd > costLimitUsd) {
    return {
      success: false,
      fieldErrors: {
        estimatedCost: `Cost must be $${costLimitUsd.toFixed(2)} or less for this challenge.`,
      },
    };
  }
  return { success: true, data: parsed.data };
}
