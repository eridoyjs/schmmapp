'use client';

import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useUserClaims } from '@/hooks/use-user-claims';
import { collection, query, orderBy, doc, where } from 'firebase/firestore';
import type { Student, School } from '@/lib/types';
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
import AddStudentDialog from './add-student-dialog';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CLASSES, SESSIONS, SHIFTS } from '@/lib/config';


function StudentRow({ student }: { student: Student }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{student.name}</TableCell>
      <TableCell>{student.class}</TableCell>
      <TableCell>{student.roll}</TableCell>
      <TableCell>{student.shift}</TableCell>
      <TableCell>{student.session}</TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono">{student.loginCode}</Badge>
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
              <DropdownMenuItem className="text-destructive">Delete Student</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function StudentsPage() {
  const { firestore } = useFirebase();
  const { claims, isLoading: claimsLoading } = useUserClaims();
  const schoolId = claims?.schoolId;

  const [classFilter, setClassFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');

  const schoolRef = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return doc(firestore, `schools/${schoolId}`);
  }, [firestore, schoolId]);

  const { data: schoolData, isLoading: schoolLoading } = useDoc<School>(schoolRef);

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    
    const studentsCollection = collection(firestore, `schools/${schoolId}/students`);
    
    const constraints = [];
    if (classFilter !== 'all') {
      constraints.push(where('class', '==', classFilter));
    }
    if (sessionFilter !== 'all') {
      constraints.push(where('session', '==', sessionFilter));
    }
    if (shiftFilter !== 'all') {
      constraints.push(where('shift', '==', shiftFilter));
    }
    constraints.push(orderBy('name'));

    return query(studentsCollection, ...constraints);

  }, [firestore, schoolId, classFilter, sessionFilter, shiftFilter]);

  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);
  const isLoading = claimsLoading || studentsLoading || schoolLoading;

  const handleResetFilters = () => {
    setClassFilter('all');
    setSessionFilter('all');
    setShiftFilter('all');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Student Management</h2>
          <p className="text-muted-foreground">
            Add, view, and manage students in your school.
          </p>
        </div>
        {schoolId && !isLoading && (
          <AddStudentDialog 
            schoolId={schoolId}
            studentCount={students?.length ?? 0}
            schoolData={schoolData}
          />
        )}
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine the student list based on the criteria below.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
                <Label htmlFor="class-filter">Class</Label>
                <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger id="class-filter">
                        <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1 space-y-2">
                <Label htmlFor="session-filter">Session</Label>
                <Select value={sessionFilter} onValueChange={setSessionFilter}>
                    <SelectTrigger id="session-filter">
                        <SelectValue placeholder="Filter by session" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sessions</SelectItem>
                        {SESSIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1 space-y-2">
                <Label htmlFor="shift-filter">Shift</Label>
                <Select value={shiftFilter} onValueChange={setShiftFilter}>
                    <SelectTrigger id="shift-filter">
                        <SelectValue placeholder="Filter by shift" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Shifts</SelectItem>
                        {SHIFTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="flex items-end">
                <Button variant="outline" onClick={handleResetFilters}>Reset</Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>A list of enrolled students matching your filter criteria.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Roll</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Login Code</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && students?.map((s) => <StudentRow key={s.id} student={s} />)}
              {!isLoading && (!students || students.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">No students found matching your criteria.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
