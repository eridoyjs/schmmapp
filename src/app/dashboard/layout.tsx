'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useUserClaims } from '@/hooks/use-user-claims';
import type { UserRole } from '@/lib/types';
import Header from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Loader2, ShieldX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


const pageAccess: Record<string, UserRole[]> = {
  '/dashboard/schools': ['master'],
  '/dashboard/subscriptions': ['master'],
  '/dashboard/students': ['admin'],
  '/dashboard/teachers': ['admin'],
  '/dashboard/results': ['admin'],
  '/dashboard/payments': ['admin'],
  '/dashboard/notices': ['admin', 'teacher', 'student'],
  '/dashboard/result-entry': ['teacher'],
  '/dashboard/my-students': ['teacher'],
  '/dashboard/my-result': ['student'],
  '/dashboard/my-payments': ['student'],
  '/dashboard': ['master', 'admin', 'teacher', 'student'],
};

function FullScreenLoader() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}

function AccessDenied() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
           <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className='mx-auto bg-destructive/10 text-destructive p-3 rounded-full w-fit'>
                        <ShieldX className='h-8 w-8' />
                    </div>
                    <CardTitle className="text-2xl text-destructive font-headline">Access Denied</CardTitle>
                    <CardDescription>
                        You do not have permission to view this page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Please contact your administrator if you believe this is an error.
                    </p>
                </CardContent>
           </Card>
        </div>
    )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const { claims, isLoading: claimsLoading } = useUserClaims();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || claimsLoading;
  
  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!user || !claims) {
    // This can happen briefly between user loading and claims loading.
    // Or if a user is logged in but has no claims (error state).
    return <FullScreenLoader />;
  }

  const userRole = claims.role;
  
  // Find the most specific matching path rule
  const matchingPath = Object.keys(pageAccess)
    .filter(path => pathname.startsWith(path))
    .sort((a, b) => b.length - a.length)[0];

  const hasAccess = matchingPath ? pageAccess[matchingPath].includes(userRole) : false;

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
