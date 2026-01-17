'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
export default function MyStudentsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">My Students</h2>
                <p className="text-muted-foreground">
                    View students assigned to your classes.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Assigned Students</CardTitle>
                    <CardDescription>A list of all students you teach.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Student list coming soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}
