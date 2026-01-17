'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateNotice } from '@/lib/actions';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  targetAudience: z.enum(['all', 'teacher', 'student', 'class']),
  classDetails: z.string().optional(),
  content: z
    .string()
    .min(20, { message: 'Content must be at least 20 characters.' }),
  published: z.boolean().default(false),
});

type NoticeFormValues = z.infer<typeof formSchema>;

interface CreateNoticeDialogProps {
  schoolId: string | undefined;
}

export default function CreateNoticeDialog({ schoolId }: CreateNoticeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      targetAudience: 'all',
      classDetails: '',
      content: '',
      published: false,
    },
  });

  const watchTargetAudience = form.watch('targetAudience');

  const onGenerate = async () => {
    const title = form.getValues('title');
    const targetAudience = form.getValues('targetAudience');
    const classDetails = form.getValues('classDetails');

    if (!title) {
      form.setError('title', { message: 'Please enter a title first.' });
      return;
    }

    setIsGenerating(true);
    const result = await handleGenerateNotice({ title, targetAudience, classDetails });
    setIsGenerating(false);

    if (result.success && result.content) {
      form.setValue('content', result.content, { shouldValidate: true });
      toast({
        title: 'Content Generated',
        description: 'AI has generated the notice content for you.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };

  const onSubmit = (data: NoticeFormValues) => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
        return;
    };

    if (!schoolId) {
        toast({ variant: 'destructive', title: 'Error', description: 'School ID is missing. Cannot create notice.' });
        return;
    }

    const noticeCollection = collection(firestore, `schools/${schoolId}/notices`);
    
    addDocumentNonBlocking(noticeCollection, {
      ...data,
      schoolId: schoolId,
      createdAt: serverTimestamp(),
    });

    toast({
      title: 'Notice Created!',
      description: `The notice "${data.title}" has been saved.`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!schoolId}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Notice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New Notice</DialogTitle>
          <DialogDescription>
            Fill in the details below. You can use AI to help generate the
            content.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Annual Sports Day" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an audience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="teacher">Teachers</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="class">Specific Class</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {watchTargetAudience === 'class' && (
                <FormField
                  control={form.control}
                  name="classDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Details</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Class 10, Section A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Content</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onGenerate}
                      disabled={!form.watch('title') || isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
                      )}
                      Generate with AI
                    </Button>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your notice here, or let AI do the work!"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Publish Notice</FormLabel>
                      <DialogDescription>
                        Make this notice visible to the target audience immediately.
                      </DialogDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Notice</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
