'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import jsPDF from 'jspdf';
import { PlusCircle, Download } from 'lucide-react';
import { useFirebase, useUser, useCollection, useMemoFirebase, addDocumentNonBlocking, useDoc } from '@/firebase';
import { useUserClaims } from '@/hooks/use-user-claims';
import { collection, query, where, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import type { Payment, Student, School } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PAYMENT_METHODS } from '@/lib/config';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  method: z.string({ required_error: 'Please select a payment method.' }),
  trx: z.string().min(6, { message: 'Transaction ID is required.'}),
});

function PaymentRequestDialog({ studentId, studentName, schoolId }: { studentId: string; studentName: string; schoolId: string }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: 0, trx: '' },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!firestore) return;

    const paymentsCollection = collection(firestore, `schools/${schoolId}/payments`);
    addDocumentNonBlocking(paymentsCollection, {
      ...data,
      studentId,
      studentName,
      schoolId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    toast({
      title: 'Payment Request Submitted!',
      description: 'Your payment is now pending approval from the admin.',
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Make a Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Payment Request</DialogTitle>
          <DialogDescription>
            Enter your payment details below. Your payment will be marked as pending until approved by an administrator.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (USD)</FormLabel>
                <FormControl><Input type="number" placeholder="50.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="method" render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a method" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="trx" render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction ID</FormLabel>
                <FormControl><Input placeholder="Enter the Trx ID from your payment" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Submit for Approval</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PaymentRow({ payment, studentData, schoolData }: { payment: Payment, studentData: Student | null, schoolData: School | null }) {
    
  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
        case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  }

  const generateReceipt = () => {
    if (!studentData || !schoolData) return;

    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text(schoolData.name, 20, 20);
    doc.setFontSize(12);
    doc.text(schoolData.address || '123 Education Lane, Knowledge City', 20, 28);
    
    doc.setFontSize(18);
    doc.text("Payment Receipt", 20, 45);

    doc.line(20, 48, 190, 48);

    doc.setFontSize(12);
    doc.text(`Student Name: ${studentData.name}`, 20, 60);
    doc.text(`Class: ${studentData.class}`, 20, 67);
    doc.text(`Roll: ${studentData.roll}`, 20, 74);
    
    doc.text(`Receipt ID: ${payment.trx}`, 130, 60);
    const approvedDate = (payment.approvedAt && 'seconds' in payment.approvedAt) 
        ? new Date(payment.approvedAt.seconds * 1000).toLocaleDateString() 
        : new Date().toLocaleDateString();
    doc.text(`Date: ${approvedDate}`, 130, 67);
    
    doc.line(20, 85, 190, 85);
    doc.text("Description", 20, 92);
    doc.text("Amount", 170, 92, { align: 'right' });
    doc.line(20, 95, 190, 95);

    doc.text("School Fees", 20, 102);
    const amountFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payment.amount);
    doc.text(amountFormatted, 170, 102, { align: 'right' });

    doc.line(20, 115, 190, 115);
    doc.setFont('helvetica', 'bold');
    doc.text("Total Paid", 20, 122);
    doc.text(amountFormatted, 170, 122, { align: 'right' });
    
    doc.save(`receipt-${payment.trx}.pdf`);
  };

  return (
    <TableRow>
      <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payment.amount)}</TableCell>
      <TableCell className="capitalize">{payment.method}</TableCell>
      <TableCell>{payment.trx}</TableCell>
      <TableCell>
        {'seconds' in payment.createdAt ? new Date(payment.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString()}
      </TableCell>
      <TableCell>{getStatusBadge(payment.status)}</TableCell>
      <TableCell>
        {payment.status === 'approved' && (
          <Button variant="outline" size="sm" onClick={generateReceipt} disabled={!studentData || !schoolData}>
            <Download className="mr-2 h-4 w-4"/>
            Receipt
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function MyPaymentsPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { claims, isLoading: claimsLoading } = useUserClaims();
  
  const studentId = user?.uid;
  const schoolId = claims?.schoolId;

  const studentRef = useMemoFirebase(() => {
    if (!firestore || !studentId || !schoolId) return null;
    return doc(firestore, `schools/${schoolId}/students/${studentId}`);
  }, [firestore, studentId, schoolId]);
  const { data: studentData, isLoading: studentLoading } = useDoc<Student>(studentRef);

  const schoolRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, `schools/${schoolId}`);
  }, [firestore, schoolId]);
  const { data: schoolData, isLoading: schoolLoading } = useDoc<School>(schoolRef);

  const paymentsQuery = useMemoFirebase(() => {
    if (!firestore || !studentId || !schoolId) return null;
    return query(
      collection(firestore, `schools/${schoolId}/payments`), 
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, studentId, schoolId]);

  const { data: payments, isLoading: paymentsLoading } = useCollection<Payment>(paymentsQuery);
  const effectiveIsLoading = isUserLoading || claimsLoading || studentLoading || schoolLoading || paymentsLoading;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">My Payments</h2>
          <p className="text-muted-foreground">
            Submit new payments and view your payment history.
          </p>
        </div>
        {!effectiveIsLoading && studentId && schoolId && studentData && (
          <PaymentRequestDialog studentId={studentId} schoolId={schoolId} studentName={studentData.name} />
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>A record of all your payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {effectiveIsLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-28" /></TableCell>
                </TableRow>
              ))}
              {!effectiveIsLoading && payments?.map((p) => <PaymentRow key={p.id} payment={p} studentData={studentData} schoolData={schoolData} />)}
              {!effectiveIsLoading && (!payments || payments.length === 0) && (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">No payments made yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    