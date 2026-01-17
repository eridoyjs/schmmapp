'use client';

import { useFirebase, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { useUserClaims } from '@/hooks/use-user-claims';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Result } from '@/lib/types';
import { Button } from "@/components/ui/button";
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function ResultRow({ result }: { result: Result }) {
  const { firestore } = useFirebase();
  
  const handlePublishToggle = (resultId: string, currentStatus: boolean) => {
    if (!firestore) return;
    const resultRef = doc(firestore, `schools/${result.schoolId}/results/${resultId}`);
    updateDocumentNonBlocking(resultRef, { published: !currentStatus });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{result.studentName}</TableCell>
      <TableCell>{result.examName}</TableCell>
      <TableCell className="font-bold">{result.gpa.toFixed(2)}</TableCell>
      <TableCell>
        {'seconds' in result.createdAt ? new Date(result.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
      </TableCell>
      <TableCell>
        <Switch
          checked={result.published}
          onCheckedChange={() => handlePublishToggle(result.id, result.published)}
          aria-label="Publish result"
        />
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
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem className='text-destructive'>Delete Result</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function ResultsAdminPage() {
  const { firestore } = useFirebase();
  const { claims, isLoading: claimsLoading } = useUserClaims();
  const schoolId = claims?.schoolId;

  const resultsQuery = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return query(collection(firestore, `schools/${schoolId}/results`), orderBy('createdAt', 'desc'));
  }, [firestore, schoolId]);

  const { data: results, isLoading: resultsLoading } = useCollection<Result>(resultsQuery);

  const isLoading = claimsLoading || resultsLoading;

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Result Management</h2>
            <p className="text-muted-foreground">
                View, publish, and manage student results.
            </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Student Results</CardTitle>
          <CardDescription>
            A list of all results entered for your school.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    </TableRow>
                ))
              )}
              {!isLoading && results && results.map((result) => (
                <ResultRow key={result.id} result={result} />
              ))}
               {!isLoading && (!results || results.length === 0) && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No results found. Go to "Result Entry" to create one.
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
