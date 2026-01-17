'use server';

import { generateTargetedNotice, type GenerateTargetedNoticeInput } from '@/ai/flows/generate-targeted-notices';
import { z } from 'zod';

type FormState = {
  success: boolean;
  content?: string;
  error?: string;
};

const ActionInputSchema = z.object({
  title: z.string(),
  targetAudience: z.enum(['all', 'teacher', 'student', 'class']),
  classDetails: z.string().optional(),
});

export async function handleGenerateNotice(input: z.infer<typeof ActionInputSchema>): Promise<FormState> {
  const validatedInput = ActionInputSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      success: false,
      error: 'Invalid input.',
    };
  }

  try {
    const result = await generateTargetedNotice(validatedInput.data);
    return {
      success: true,
      content: result.content,
    };
  } catch (error) {
    console.error('AI generation failed:', error);
    return {
      success: false,
      error: 'Failed to generate content. Please try again.',
    };
  }
}
