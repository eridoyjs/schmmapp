'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, AlertTriangle } from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
  } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { School } from '@/lib/types';
import { CLASSES, SUBJECTS } from '@/lib/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  assignedClass: z.string({ required_error: 'Please select a class.' }),
  assignedSubjects: z.array(z.string()).min(1, { message: 'At least one subject is required.' }),
});

type TeacherFormValues = z.infer<typeof formSchema>;

interface AddTeacherDialogProps {
  schoolId: string;
  teacherCount: number;
  schoolData: School | null;
}

export default function AddTeacherDialog({ schoolId, teacherCount, schoolData }: AddTeacherDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      assignedSubjects: [],
    },
  });

  const teacherLimit = schoolData?.subscription.maxTeacher ?? 0;
  const limitReached = teacherCount >= teacherLimit;

  const onSubmit = (data: TeacherFormValues) => {
    if (!firestore) return;

    if (limitReached) {
      toast({
        variant: 'destructive',
        title: 'Teacher Limit Reached',
        description: 'You cannot add more teachers. Please upgrade your subscription.',
      });
      return;
    }

    const teachersCollection = collection(firestore, `schools/${schoolId}/teachers`);
    
    const loginCode = `TCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    addDocumentNonBlocking(teachersCollection, {
      ...data,
      schoolId: schoolId,
      loginCode: loginCode,
    });

    toast({
      title: 'Teacher Added!',
      description: `${data.name} has been added with login code: ${loginCode}`,
    });
    setOpen(false);
    form.reset();
  };

  const selectedSubjects = form.watch('assignedSubjects') || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Fill in the details for the new teacher. A unique login code will be generated.
          </DialogDescription>
        </DialogHeader>
        {limitReached && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Subscription Limit Reached</AlertTitle>
            <AlertDescription>
              You have {teacherCount}/{teacherLimit} teachers. Please upgrade your plan to add more.
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="assignedClass" render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                  <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField
              control={form.control}
              name="assignedSubjects"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Assigned Subjects</FormLabel>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-start font-normal h-auto min-h-10">
                                <div className="flex gap-1 flex-wrap">
                                {selectedSubjects.length > 0 ? (
                                    selectedSubjects.map(subject => <Badge variant="secondary" key={subject}>{subject}</Badge>)
                                ) : (
                                    <span className="text-muted-foreground">Select subjects</span>
                                )}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                            <DropdownMenuLabel>Available Subjects</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {SUBJECTS.map(subject => (
                                <DropdownMenuCheckboxItem
                                    key={subject}
                                    checked={selectedSubjects.includes(subject)}
                                    onCheckedChange={(checked) => {
                                        const currentSubjects = selectedSubjects;
                                        const newSubjects = checked
                                            ? [...currentSubjects, subject]
                                            : currentSubjects.filter(s => s !== subject);
                                        field.onChange(newSubjects);
                                    }}
                                    onSelect={(e) => e.preventDefault()} // prevent closing
                                >
                                    {subject}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={limitReached}>Save Teacher</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
