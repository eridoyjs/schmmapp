'use server';

/**
 * @fileOverview An AI agent for generating notice content based on a title and target audience.
 *
 * - generateTargetedNotice - A function that generates notice content.
 * - GenerateTargetedNoticeInput - The input type for the generateTargetedNotice function.
 * - GenerateTargetedNoticeOutput - The return type for the generateTargetedNotice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTargetedNoticeInputSchema = z.object({
  title: z.string().describe('The title of the notice.'),
  targetAudience: z
    .enum(['all', 'teacher', 'student', 'class'])
    .describe('The target audience for the notice.'),
  classDetails: z.string().optional().describe('Details of the class if targetting a specific class'),
});

export type GenerateTargetedNoticeInput = z.infer<
  typeof GenerateTargetedNoticeInputSchema
>;

const GenerateTargetedNoticeOutputSchema = z.object({
  content: z.string().describe('The generated content of the notice.'),
});

export type GenerateTargetedNoticeOutput = z.infer<
  typeof GenerateTargetedNoticeOutputSchema
>;

export async function generateTargetedNotice(
  input: GenerateTargetedNoticeInput
): Promise<GenerateTargetedNoticeOutput> {
  return generateTargetedNoticeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTargetedNoticePrompt',
  input: {schema: GenerateTargetedNoticeInputSchema},
  output: {schema: GenerateTargetedNoticeOutputSchema},
  prompt: `You are an expert assistant for school administrators, skilled at creating engaging and informative notices for various audiences.

  Based on the title and target audience, generate content for a school notice.

  Title: {{{title}}}
  Target Audience: {{{targetAudience}}}
  Class Details: {{#if classDetails}}{{{classDetails}}}{{else}}Not Applicable{{/if}}

  Content:`, // Removed intentional space
});

const generateTargetedNoticeFlow = ai.defineFlow(
  {
    name: 'generateTargetedNoticeFlow',
    inputSchema: GenerateTargetedNoticeInputSchema,
    outputSchema: GenerateTargetedNoticeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
