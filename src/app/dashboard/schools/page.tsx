'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { useUserClaims } from '@/hooks/use-user-claims';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { School } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AddSchoolDialog from './add-school-dialog';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function SchoolRow({ school }: { school: School }) {
  const expiryDate = (school.subscription.expiry && 'seconds' in school.subscription.expiry)
    ? new Date(school.subscription.expiry.seconds * 1000)
    : school.subscription.expiry;

  const isExpired = new Date() > expiryDate;

  return (
    <TableRow>
      <TableCell className="font-medium">{school.name}</TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono">{school.code}</Badge>
      </TableCell>
      <TableCell>{school.subscription.maxStudent}</TableCell>
      <TableCell>{school.subscription.maxTeacher}</TableCell>
      <TableCell>
        <Badge variant={isExpired ? 'destructive' : 'secondary'}>
          {expiryDate.toLocaleDateString()}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit Details</DropdownMenuItem>
              <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Disable School</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function SchoolsPage() {
  const { firestore } = useFirebase();
  const { claims, isLoading: claimsLoading } = useUserClaims();
  
  // This page should only be accessible by master users, but we add a client-side check.
  const isMaster = claims?.role === 'master';

  const schoolsQuery = useMemoFirebase(() => {
    if (!firestore || !isMaster) return null;
    return query(collection(firestore, `schools`), orderBy('name'));
  }, [firestore, isMaster]);

  const { data: schools, isLoading: schoolsLoading } = useCollection<School>(schoolsQuery);
  const isLoading = claimsLoading || schoolsLoading;

  if (!claimsLoading && !isMaster) {
      return (
          <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">You do not have permission to access this page.</p>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">School Management</h2>
          <p className="text-muted-foreground">
            Create and manage all schools on the platform.
          </p>
        </div>
        <AddSchoolDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School List</CardTitle>
          <CardDescription>A list of all schools on the RHOM School Management platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>School Code</TableHead>
                <TableHead>Student Limit</TableHead>
                <TableHead>Teacher Limit</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && schools?.map((s) => <SchoolRow key={s.id} school={s} />)}
              {!isLoading && (!schools || schools.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No schools found. Create one to get started.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
