'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function CodeLoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">User Portal</CardTitle>
        <CardDescription>
          Enter your school & user code to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schoolCode">School Code</Label>
            <Input id="schoolCode" placeholder="e.g., SCHL12345" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userCode">Your Login Code</Label>
            <Input id="userCode" placeholder="e.g., TCH-ABCDE or STU-FGHIJ" required />
          </div>
          <Button type="submit" className="w-full" disabled>
            Sign In (Coming Soon)
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Are you an Admin or Master?{' '}
          <Link href="/" className="underline">
            Find your portal
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
