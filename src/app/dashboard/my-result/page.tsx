'use client';

import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { useUserClaims } from '@/hooks/use-user-claims';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Result } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getGradeLetter } from '@/lib/gpa';

function ResultCard({ result }: { result: Result }) {
  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-start'>
            <div>
                <CardTitle>{result.examName}</CardTitle>
                <CardDescription>
                Published on: {'seconds' in result.createdAt ? new Date(result.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                </CardDescription>
            </div>
            <div className='text-right'>
                <p className='text-sm text-muted-foreground'>GPA</p>
                <p className={`text-3xl font-bold ${result.gpa > 0 ? 'text-foreground' : 'text-destructive'}`}>{result.gpa.toFixed(2)}</p>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {result.subjects.map((subject) => (
            <div key={subject.name} className="flex flex-col items-center justify-center p-4 border rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">{subject.name}</p>
              <p className="text-2xl font-bold">{subject.mark}</p>
              <Badge variant="secondary" className="mt-1">{getGradeLetter(subject.mark)}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <p className={`text-lg font-bold ${result.gpa > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {result.gpa > 0 ? `Congratulations! You have passed.` : `You have failed.`}
        </p>
      </CardFooter>
    </Card>
  );
}


export default function MyResultPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { claims, isLoading: claimsLoading } = useUserClaims();
  
  const schoolId = claims?.schoolId;
  const studentId = user?.uid;

  const resultsQuery = useMemoFirebase(() => {
    if (!firestore || !studentId || !schoolId) return null;
    return query(
      collection(firestore, `schools/${schoolId}/results`),
      where('studentId', '==', studentId),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, studentId, schoolId]);

  const { data: results, isLoading: resultsLoading } = useCollection<Result>(resultsQuery);
  const isLoading = resultsLoading || isUserLoading || claimsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">My Results</h2>
        <p className="text-muted-foreground">
          View your published academic results.
        </p>
      </div>

      <div className="space-y-6">
        {isLoading && (
            Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/4 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            ))
        )}

        {!isLoading && results && results.map(result => (
            <ResultCard key={result.id} result={result} />
        ))}

        {!isLoading && (!results || results.length === 0) && (
             <Card className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No results have been published for you yet.</p>
            </Card>
        )}
      </div>
    </div>
  );
}
