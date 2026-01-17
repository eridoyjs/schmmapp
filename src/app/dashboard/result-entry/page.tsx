'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { useUserClaims } from '@/hooks/use-user-claims';
import { collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { PlusCircle, Trash2 } from 'lucide-react';
import { calculateGPA } from '@/lib/gpa';
import { SUBJECTS } from '@/lib/config';
import type { Student } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const subjectSchema = z.object({
  name: z.string(),
  mark: z.coerce.number().min(0).max(100),
});

const formSchema = z.object({
  studentId: z.string({ required_error: 'Please select a student.' }),
  examName: z.string().min(3, { message: 'Exam name is required.' }),
  subjects: z.array(subjectSchema).min(1),
});

type ResultFormValues = z.infer<typeof formSchema>;

export default function ResultEntryPage() {
  const [calculatedGpa, setCalculatedGpa] = useState<number | null>(null);
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { claims, isLoading: claimsLoading } = useUserClaims();
  const schoolId = claims?.schoolId;

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return query(collection(firestore, `schools/${schoolId}/students`), orderBy('name'));
  }, [firestore, schoolId]);

  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);
  
  const form = useForm<ResultFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      examName: '',
      subjects: [{ name: SUBJECTS[0], mark: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjects',
  });
  
  const watchSubjects = form.watch('subjects');

  useEffect(() => {
    if (watchSubjects) {
      const gpa = calculateGPA(watchSubjects);
      setCalculatedGpa(gpa);
    }
  }, [watchSubjects]);

  const onSubmit = (data: ResultFormValues) => {
    if (!firestore || !schoolId || !students) return;
    
    const gpa = calculateGPA(data.subjects);
    const studentName = students.find(s => s.id === data.studentId)?.name || 'Unknown';

    const resultCollection = collection(firestore, `schools/${schoolId}/results`);
    addDocumentNonBlocking(resultCollection, {
      ...data,
      studentName,
      schoolId,
      gpa,
      published: false, // Always false on creation by teacher
      createdAt: serverTimestamp(),
    });

    toast({
      title: 'Result Saved!',
      description: `Result for ${data.examName} has been saved as a draft.`,
    });
    form.reset({
      studentId: '',
      examName: '',
      subjects: [{ name: SUBJECTS[0], mark: 0 }],
    });
    setCalculatedGpa(null);
  };

  const isLoading = studentsLoading || claimsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">Result Entry</h2>
        <p className="text-muted-foreground">
          Enter student marks for an exam. Results are saved as drafts.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exam & Student Details</CardTitle>
              <CardDescription>Select the student and the exam.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students?.map(s => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} (Class: {s.class} | Roll: {s.roll})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="examName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mid-term Examination" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enter Marks</CardTitle>
              <CardDescription>Add subjects and enter the marks obtained.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name={`subjects.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`subjects.${index}.mark`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" placeholder="Mark" className="w-28" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: SUBJECTS[0], mark: 0 })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
                 <div>
                    <p className="text-sm font-medium text-muted-foreground">Calculated GPA</p>
                    <p className="text-4xl font-bold">
                        {calculatedGpa !== null ? calculatedGpa.toFixed(2) : 'N/A'}
                    </p>
                 </div>
                <Button type="submit" size="lg" disabled={isLoading}>Save Result as Draft</Button>
            </CardContent>
          </Card>

        </form>
      </Form>
    </div>
  );
}
