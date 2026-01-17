'use client';

import { useFirebase, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import type { Payment } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useUserClaims } from '@/hooks/use-user-claims';

function PaymentRow({ payment }: { payment: Payment }) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const studentName = payment.studentName || 'Unknown Student';

  const handleStatusUpdate = (newStatus: 'approved' | 'rejected') => {
    if (!firestore) return;
    const paymentRef = doc(firestore, `schools/${payment.schoolId}/payments/${payment.id}`);
    
    let updateData: { status: string, approvedAt?: any } = { status: newStatus };
    if (newStatus === 'approved') {
        updateData.approvedAt = serverTimestamp();
    }

    updateDocumentNonBlocking(paymentRef, updateData);

    toast({
        title: "Payment Updated",
        description: `Payment from ${studentName} has been ${newStatus}.`
    })
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
        case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{studentName}</TableCell>
      <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payment.amount)}</TableCell>
      <TableCell className="capitalize">{payment.method}</TableCell>
      <TableCell>{payment.trx}</TableCell>
       <TableCell>
        {'seconds' in payment.createdAt ? new Date(payment.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString()}
      </TableCell>
      <TableCell>{getStatusBadge(payment.status)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={payment.status !== 'pending'}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleStatusUpdate('approved')}>Approve</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate('rejected')} className='text-destructive'>Reject</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function PaymentsAdminPage() {
  const { firestore } = useFirebase();
  const { claims, isLoading: claimsLoading } = useUserClaims();
  const schoolId = claims?.schoolId;

  const paymentsQuery = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return query(collection(firestore, `schools/${schoolId}/payments`), orderBy('createdAt', 'desc'));
  }, [firestore, schoolId]);

  const { data: payments, isLoading: paymentsLoading } = useCollection<Payment>(paymentsQuery);
  const isLoading = claimsLoading || paymentsLoading;

  return (
    <div className="space-y-8">
       <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Payment Management</h2>
            <p className="text-muted-foreground">
                Approve or reject student payment submissions.
            </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>All Student Payments</CardTitle>
          <CardDescription>
            A list of all payment records for your school.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    </TableRow>
                ))
              )}
              {!isLoading && payments && payments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
               {!isLoading && (!payments || payments.length === 0) && (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No payments found.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    