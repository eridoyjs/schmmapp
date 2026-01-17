'use client';

import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useUserClaims } from '@/hooks/use-user-claims';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Teacher, School } from '@/lib/types';
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
import AddTeacherDialog from './add-teacher-dialog';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function TeacherRow({ teacher }: { teacher: Teacher }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{teacher.name}</TableCell>
      <TableCell>{teacher.assignedClass}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
            {teacher.assignedSubjects.map(subject => <Badge key={subject} variant="secondary">{subject}</Badge>)}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono">{teacher.loginCode}</Badge>
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
              <DropdownMenuItem className="text-destructive">Delete Teacher</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function TeachersPage() {
  const { firestore } = useFirebase();
  const { claims, isLoading: claimsLoading } = useUserClaims();
  const schoolId = claims?.schoolId;

  const schoolRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, `schools/${schoolId}`);
  }, [firestore, schoolId]);

  const { data: schoolData, isLoading: schoolLoading } = useDoc<School>(schoolRef);

  const teachersQuery = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return query(collection(firestore, `schools/${schoolId}/teachers`), orderBy('name'));
  }, [firestore, schoolId]);

  const { data: teachers, isLoading: teachersLoading } = useCollection<Teacher>(teachersQuery);
  const isLoading = claimsLoading || teachersLoading || schoolLoading;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Teacher Management</h2>
          <p className="text-muted-foreground">
            Add, view, and manage teachers in your school.
          </p>
        </div>
        {schoolId && !isLoading && (
          <AddTeacherDialog 
            schoolId={schoolId}
            teacherCount={teachers?.length ?? 0}
            schoolData={schoolData}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher List</CardTitle>
          <CardDescription>A list of all teachers in your school.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Assigned Class</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Login Code</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && teachers?.map((t) => <TeacherRow key={t.id} teacher={t} />)}
              {!isLoading && (!teachers || teachers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No teachers found. Add one to get started.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
