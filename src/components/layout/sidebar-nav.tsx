'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookUser,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  CreditCard,
  ClipboardCheck,
  Building,
  Users,
} from 'lucide-react';
import { useUserClaims } from '@/hooks/use-user-claims';

import { SchoolVerseLogo } from '@/components/icons';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '../ui/skeleton';
import type { UserRole } from '@/lib/types';

const navItems: { href: string; label: string; icon: React.ElementType; roles: UserRole[] }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['master', 'admin', 'teacher', 'student'] },
  { href: '/dashboard/schools', label: 'Schools', icon: Building, roles: ['master'] },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard, roles: ['master'] },
  { href: '/dashboard/students', label: 'Students', icon: GraduationCap, roles: ['admin'] },
  { href: '/dashboard/teachers', label: 'Teachers', icon: BookUser, roles: ['admin'] },
  { href: '/dashboard/results', label: 'Results', icon: ClipboardCheck, roles: ['admin'] },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard, roles: ['admin'] },
  { href: '/dashboard/notices', label: 'Notices', icon: Megaphone, roles: ['admin', 'teacher', 'student'] },
  { href: '/dashboard/my-students', label: 'My Students', icon: Users, roles: ['teacher'] },
  { href: '/dashboard/result-entry', label: 'Result Entry', icon: ClipboardCheck, roles: ['teacher'] },
  { href: '/dashboard/my-result', label: 'My Result', icon: ClipboardCheck, roles: ['student'] },
  { href: '/dashboard/my-payments', label: 'My Payments', icon: CreditCard, roles: ['student'] },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { claims, isLoading } = useUserClaims();
  const role = claims?.role;

  const accessibleNavItems = navItems.filter(item => role && item.roles.includes(role));

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <SchoolVerseLogo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight font-headline text-primary-foreground group-data-[collapsible=icon]:hidden">
            RHOM School Management
          </span>
        </div>
      </SidebarHeader>
      <Separator className="bg-sidebar-border" />
      <SidebarContent>
        <SidebarMenu>
          {isLoading && (
             <div className='p-2 flex flex-col gap-1'>
                {Array.from({ length: 5 }).map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
             </div>
          )}
          {!isLoading && accessibleNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href.length > 10 || pathname === '/dashboard')}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator className="my-2 bg-sidebar-border" />
      <SidebarFooter>
        <div className="text-xs text-sidebar-foreground/50 px-2 group-data-[collapsible=icon]:hidden">
            <p>&copy; {new Date().getFullYear()} RHOM School Management</p>
            {isLoading ? 
                <Skeleton className="h-4 w-12 mt-1" /> :
                (role && <p>Role: <span className="capitalize font-medium text-sidebar-foreground/80">{role}</span></p>)
            }
        </div>
      </SidebarFooter>
    </>
  );
}
