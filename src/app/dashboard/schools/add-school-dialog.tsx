'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(3, { message: 'School name must be at least 3 characters.' }),
  address: z.string().optional(),
  maxStudent: z.coerce.number().min(1, { message: 'Must allow at least 1 student.' }),
  maxTeacher: z.coerce.number().min(1, { message: 'Must allow at least 1 teacher.' }),
  expiry: z.date({
    required_error: "A subscription expiry date is required.",
  }),
});

type SchoolFormValues = z.infer<typeof formSchema>;

export default function AddSchoolDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      maxStudent: 100,
      maxTeacher: 10,
    },
  });

  const onSubmit = (data: SchoolFormValues) => {
    if (!firestore) return;

    const schoolsCollection = collection(firestore, `schools`);
    
    const schoolCode = `SCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    addDocumentNonBlocking(schoolsCollection, {
      name: data.name,
      address: data.address,
      code: schoolCode,
      status: 'active',
      subscription: {
          maxStudent: data.maxStudent,
          maxTeacher: data.maxTeacher,
          expiry: Timestamp.fromDate(data.expiry),
      }
    });

    toast({
      title: 'School Created!',
      description: `${data.name} has been created with code: ${schoolCode}`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create School
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New School</DialogTitle>
          <DialogDescription>
            Fill in the school's details and set its initial subscription plan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>School Name</FormLabel>
                <FormControl><Input placeholder="e.g., North Point School" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

             <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl><Input placeholder="123 Education Lane, Knowledge City" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <fieldset className='rounded-lg border p-4'>
                <legend className='-ml-1 px-1 text-sm font-medium'>Subscription Details</legend>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <FormField control={form.control} name="maxStudent" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Student Limit</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="maxTeacher" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Teacher Limit</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <FormField
                    control={form.control}
                    name="expiry"
                    render={({ field }) => (
                        <FormItem className="flex flex-col mt-4">
                        <FormLabel>Subscription Expiry</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </fieldset>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Create School</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
