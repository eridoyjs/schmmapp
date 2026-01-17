'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookUser,
  GraduationCap,
  KeyRound,
  Shield,
  ShieldCheck,
  Building2,
  Zap,
  Gauge,
  Cloud,
  Lock,
} from 'lucide-react';
import { useUser } from '@/firebase';
import { SchoolVerseLogo } from '@/components/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const loginPortals = [
  {
    role: 'Master / Owner',
    description: 'SaaS owner & platform administrator.',
    href: '/login/master',
    icon: Shield,
    badge: 'Master / Owner',
    badgeClass: 'bg-purple-100 text-purple-800',
  },
  {
    role: 'School Admin',
    description: 'School principal or administrator.',
    href: '/login/admin',
    icon: KeyRound,
    badge: 'School Admin',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  {
    role: 'Teacher',
    description: 'Assigned teachers & staff members.',
    href: '/login',
    icon: BookUser,
    badge: 'Teacher',
    badgeClass: 'bg-green-100 text-green-800',
  },
  {
    role: 'Student',
    description: 'Enrolled students & guardians.',
    href: '/login',
    icon: GraduationCap,
    badge: 'Student',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
];

const features = [
    {
      icon: ShieldCheck,
      title: 'Secure Role-Based Access',
      description: 'Granular permissions for master, admin, teacher, and student roles.',
    },
    {
      icon: Building2,
      title: 'Multi-School SaaS Architecture',
      description: 'Manage multiple schools from a single, centralized platform with complete data isolation.',
    },
    {
      icon: Zap,
      title: 'Real-Time Results & Payments',
      description: 'Instant updates for grades, payments, and notices with Firestore.',
    },
    {
      icon: Gauge,
      title: 'Subscription & Limit Control',
      description: 'Enforce student and teacher limits based on subscription plans.',
    },
    {
      icon: Cloud,
      title: 'Cloud-Based & Scalable',
      description: 'Built on modern, scalable cloud infrastructure to grow with your needs.',
    },
];

const securityFeatures = [
    { name: 'Firebase Authentication' },
    { name: 'Firestore Security Rules' },
    { name: 'Role-Based Permissions' },
    { name: 'Subscription Enforcement' },
    { name: 'Cloud Functions Validation' },
]


function HeaderAuthButton() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <Skeleton className="h-10 w-28" />;
  }

  if (user) {
    return (
      <Button asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    );
  }

  return null;
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <SchoolVerseLogo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight font-headline">
            RHOM School Management
          </h1>
        </div>
        <HeaderAuthButton />
      </header>

      <div className="flex-1">
        <section className="container mx-auto px-4 pt-20 pb-10 text-center sm:px-6 md:pt-32 md:pb-16 lg:px-8">
          <Badge variant="outline" className="mb-4">
            The Future of School Management
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tighter font-headline md:text-6xl">
            One Platform to Manage Your Entire School
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            RHOM School Management is a secure, scalable SaaS platform designed to manage students, teachers, results, and payments across multiple institutions.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">
                Access Your Portal <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>

        <section
          id="login-portals"
          className="container mx-auto px-4 pt-0 pb-16 sm:px-6 lg:px-8"
        >
          <div className="mb-12 text-center">
            <h3 className="text-3xl font-bold tracking-tight font-headline">
              Login Portals
            </h3>
            <p className="mt-2 text-muted-foreground">
              Select your role to securely access your dashboard.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {loginPortals.map((portal) => (
              <Link key={portal.role} href={portal.href} className="group">
                <Card className="h-full transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <portal.icon className="h-8 w-8 text-primary" />
                      <Badge variant="secondary" className={portal.badgeClass}>{portal.badge}</Badge>
                    </div>
                    <CardTitle className="pt-4 font-headline">{portal.role}</CardTitle>
                    <CardDescription>{portal.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
                      Go to Portal <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-muted/50 py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h3 className="text-3xl font-bold tracking-tight font-headline">
                        Why Choose RHOM?
                    </h3>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                        A comprehensive solution built for modern educational institutions.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-full">
                         <feature.icon className="h-6 w-6" />
                        </div>
                        <div>
                        <h4 className="text-lg font-bold font-headline">{feature.title}</h4>
                        <p className="mt-1 text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-24">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-3xl mx-auto">
                    <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-3xl font-bold tracking-tight font-headline">
                        Enterprise-Grade Security
                    </h3>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Your data is protected with a robust, multi-layered security architecture built on industry-leading technology.
                    </p>
                </div>
                <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-4">
                    {securityFeatures.map((feature) => (
                        <Badge key={feature.name} variant="secondary" className="text-sm px-4 py-2">
                           {feature.name}
                        </Badge>
                    ))}
                </div>
            </div>
        </section>
      </div>

      <footer className="container mx-auto border-t px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center text-sm text-muted-foreground">
            <h4 className='font-bold text-foreground mb-2'>Access & Support</h4>
            <p className='max-w-md'>This platform is available through authorized schools only. Please contact your school administrator for access and support.</p>
          <p className='mt-6'>&copy; 2026 RHOM School Management. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
