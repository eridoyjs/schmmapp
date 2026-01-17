'use client';

import { useFirebase, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { useUserClaims } from '@/hooks/use-user-claims';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateNoticeDialog from "./create-notice-dialog";
import type { Notice } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';

function NoticeRow({ notice }: { notice: Notice }) {
  const { firestore } = useFirebase();

  const handlePublishToggle = (noticeId: string, currentStatus: boolean) => {
    if (!firestore) return;
    const noticeRef = doc(firestore, `schools/${notice.schoolId}/notices/${noticeId}`);
    updateDocumentNonBlocking(noticeRef, { published: !currentStatus });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{notice.title}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">{notice.publishTo === 'class' ? `Class: ${notice.content}` : notice.publishTo}</Badge>
      </TableCell>
      <TableCell>
        {'seconds' in notice.createdAt ? new Date(notice.createdAt.seconds * 1000).toLocaleDateString() : notice.createdAt.toLocaleDateString()}
      </TableCell>
      <TableCell>
        <Switch
          checked={notice.published}
          onCheckedChange={() => handlePublishToggle(notice.id, notice.published)}
          aria-label="Publish notice"
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
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className='text-destructive'>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function NoticesPage() {
  const { firestore } = useFirebase();
  const { claims, isLoading: claimsLoading } = useUserClaims();
  const schoolId = claims?.schoolId;

  const noticesQuery = useMemoFirebase(() => {
    if (!firestore || !schoolId) return null;
    return query(collection(firestore, `schools/${schoolId}/notices`), orderBy('createdAt', 'desc'));
  }, [firestore, schoolId]);

  const { data: notices, isLoading: noticesLoading } = useCollection<Notice>(noticesQuery);
  const isLoading = noticesLoading || claimsLoading;

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Notice Board</h2>
            <p className="text-muted-foreground">
                Create, manage, and publish notices for your school.
            </p>
        </div>
        <CreateNoticeDialog schoolId={schoolId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Notices</CardTitle>
          <CardDescription>
            A list of all notices for your school.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Audience</TableHead>
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
                        <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    </TableRow>
                ))
              )}
              {!isLoading && notices && notices.map((notice) => (
                <NoticeRow key={notice.id} notice={notice} />
              ))}
               {!isLoading && (!notices || notices.length === 0) && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No notices found. Create one to get started!
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
