'use client';

import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { useUserClaims } from '@/hooks/use-user-claims';
import { doc, collection, query, where } from 'firebase/firestore';
import type { School, Student, Teacher, Payment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays } from 'date-fns';

function DashboardStats() {
    const { claims, isLoading: claimsLoading } = useUserClaims();
    const { firestore } = useFirebase();
    const schoolId = claims?.schoolId;
    const role = claims?.role;

    const schoolRef = useMemoFirebase(() => {
        if (!firestore || !schoolId) return null;
        return doc(firestore, `schools/${schoolId}`);
    }, [firestore, schoolId]);
    const { data: schoolData, isLoading: schoolLoading } = useDoc<School>(schoolRef);

    // Admin-specific data
    const studentsQuery = useMemoFirebase(() => {
        if (!firestore || !schoolId || role !== 'admin') return null;
        return collection(firestore, `schools/${schoolId}/students`);
    }, [firestore, schoolId, role]);
    const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);
    
    const teachersQuery = useMemoFirebase(() => {
        if (!firestore || !schoolId || role !== 'admin') return null;
        return collection(firestore, `schools/${schoolId}/teachers`);
    }, [firestore, schoolId, role]);
    const { data: teachers, isLoading: teachersLoading } = useCollection<Teacher>(teachersQuery);

    const pendingPaymentsQuery = useMemoFirebase(() => {
        if (!firestore || !schoolId || role !== 'admin') return null;
        return query(collection(firestore, `schools/${schoolId}/payments`), where('status', '==', 'pending'));
    }, [firestore, schoolId, role]);
    const { data: pendingPayments, isLoading: paymentsLoading } = useCollection<Payment>(pendingPaymentsQuery);
    
    const isStatsLoading = claimsLoading || schoolLoading || (role === 'admin' && (studentsLoading || teachersLoading || paymentsLoading));

    const subscriptionActive = claims?.subscriptionActive;
    
    let expiresInDays = 0;
    let subscriptionStatusText = '...';
    let subscriptionStatusColor = 'text-muted-foreground';

    if (schoolData && subscriptionActive) {
        const expiryDate = (schoolData.subscription.expiry && 'seconds' in schoolData.subscription.expiry)
            ? new Date(schoolData.subscription.expiry.seconds * 1000)
            : schoolData.subscription.expiry;
        expiresInDays = differenceInDays(expiryDate, new Date());
        subscriptionStatusText = 'Active';
        subscriptionStatusColor = 'text-green-600';
    } else if (!claimsLoading && !subscriptionActive) {
        subscriptionStatusText = 'Expired';
        subscriptionStatusColor = 'text-destructive';
    }


    if (role === 'master') {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Welcome Master Admin!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You can manage all schools and subscriptions from the sidebar navigation.</p>
                </CardContent>
            </Card>
        )
    }

    if (role === 'teacher' || role === 'student') {
         return (
             <Card>
                <CardHeader>
                    <CardTitle>Welcome!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Use the sidebar to navigate to your pages and view your information.</p>
                </CardContent>
            </Card>
        )
    }

    // Admin Dashboard
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </CardHeader>
                <CardContent>
                    {isStatsLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{students?.length ?? 0}</div>}
                     <p className="text-xs text-muted-foreground">Total enrolled students</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </CardHeader>
                <CardContent>
                    {isStatsLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{teachers?.length ?? 0}</div>}
                    <p className="text-xs text-muted-foreground">Total active teachers</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
                </CardHeader>
                <CardContent>
                    {isStatsLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{pendingPayments?.length ?? 0}</div>}
                    <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </CardHeader>
                <CardContent>
                     {isStatsLoading ? (
                        <>
                         <Skeleton className="h-8 w-1/2" />
                         <Skeleton className="h-4 w-3/4 mt-1" />
                        </>
                    ) : (
                        <>
                        <div className={`text-2xl font-bold ${subscriptionStatusColor}`}>{subscriptionStatusText}</div>
                        {subscriptionActive ? (
                            <p className="text-xs text-muted-foreground">
                                {expiresInDays >= 0 ? `Expires in ${expiresInDays} days` : 'Expired'}
                            </p>
                        ) : (
                             <p className="text-xs text-muted-foreground">Please contact support.</p>
                        )}
                        </>
                     )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function DashboardPage() {
  const { claims, isLoading: isClaimsLoading } = useUserClaims();

  const getGreeting = () => {
    if (isClaimsLoading) {
        return {title: "Dashboard", description: "Welcome back! Loading your information..."};
    }
    if (!claims) {
        return {title: "Dashboard", description: "Welcome back!"};
    }
    switch (claims.role) {
        case 'master':
            return {title: "Master Dashboard", description: "Oversee the entire platform."};
        case 'admin':
            return {title: "Admin Dashboard", description: "Here's an overview of your school's activities."};
        case 'teacher':
            return {title: "Teacher Dashboard", description: "Manage your classes and students."};
        case 'student':
            return {title: "Student Dashboard", description: "View your results and payments."};
        default:
             return {title: "Dashboard", description: "Welcome back!"};
    }
  }

  const { title, description } = getGreeting();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      
      {isClaimsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({length: 4}).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-2/3" />
                    </CardHeader>
                    <CardContent>
                         <Skeleton className="h-8 w-1/2" />
                         <Skeleton className="h-4 w-3/4 mt-1" />
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : <DashboardStats />}
    </div>
  );
}
