'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
export default function SubscriptionsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">Subscription Management</h2>
                <p className="text-muted-foreground">
                    Manage school subscription plans and billing.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Subscriptions</CardTitle>
                    <CardDescription>A list of all school subscriptions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Subscription management UI coming soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}
