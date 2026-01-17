'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import type { UserRole, UserClaims } from '@/lib/types';

interface UseUserClaimsResult {
  claims: UserClaims | null;
  isLoading: boolean;
}

export function useUserClaims(): UseUserClaimsResult {
  const { user, isUserLoading } = useUser();
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setClaims(null);
      setIsLoading(false);
      return;
    }

    const getClaims = async () => {
      setIsLoading(true);
      try {
        const idTokenResult = await user.getIdTokenResult();
        const userClaims: UserClaims = {
          role: (idTokenResult.claims.role as UserRole) || 'student',
          schoolId: idTokenResult.claims.schoolId as string,
          subscriptionActive: (idTokenResult.claims.subscriptionActive as boolean) || false,
        };
        setClaims(userClaims);
      } catch (error) {
        console.error("Error fetching user claims:", error);
        setClaims(null);
      } finally {
        setIsLoading(false);
      }
    };

    getClaims();
  }, [user, isUserLoading]);

  return { claims, isLoading: isLoading || isUserLoading };
}
