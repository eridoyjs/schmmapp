# **App Name**: SchoolVerse

## Core Features:

- Multi-Tenant School Management: Support for multiple schools with individual configurations and data isolation within Firestore.
- Role-Based Access Control: Implementation of RBAC using Firebase Custom Claims to restrict access based on user roles (Master, Admin, Teacher, Student) on both frontend and backend.
- Secure Authentication: Secure user authentication via Email/Password for Masters and Admins, and code-based login for Teachers and Students.
- Subscription Management: Handle school subscriptions, track usage, and enforce limits on students and teachers, with automatic blocking upon expiry.
- Student Result Management: Allow teachers to enter student results, admins to publish them, and students to view their own results. The app prevents students from accessing unpublished results or other students' results.
- Payment Processing & Receipt Generation: Enable students to request payments, admins to approve/reject payments, and the system to generate PDF receipts via jsPDF.
- Notice Management: Allow admins to create and publish notices that target specific user groups (all, teachers, students, class).  The tool prevents cross-school notices via Firestore rules.

## Style Guidelines:

- Primary color: HSL(210, 75%, 50%) which converts to a vibrant blue (#3391FF) for a professional and trustworthy feel.
- Background color: HSL(210, 20%, 95%) which converts to a very light blue-tinted gray (#F0F6FF) to ensure readability and a clean interface.
- Accent color: HSL(180, 60%, 40%) which converts to a turquoise (#33BDBD) used for interactive elements and key actions.
- Font pairing: 'Inter' (sans-serif) for both headlines and body text; its neutral, modern style ensures clarity.
- Code font: 'Source Code Pro' for displaying code snippets, ensuring readability and clarity.
- Consistent use of flat, modern icons to represent actions and modules throughout the application.
- Clean, intuitive layout with a consistent sidebar for navigation and a clear header for user context.
- Subtle transitions and animations for a smooth user experience when navigating between modules and performing actions.