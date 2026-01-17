export const ROLES = ['master', 'admin', 'teacher', 'student'];

export const CLASSES = [
  'Play',
  'Nursery',
  'KG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

export const SESSIONS = Array.from({ length: 2050 - 2024 + 1 }, (_, i) => (2024 + i).toString());

export const SHIFTS = ['Morning', 'Day'];

export const PAYMENT_METHODS = ['Stripe', 'PayPal', 'Bank Transfer', 'Cash'];

export const SUBJECTS = ['Bangla', 'English', 'Math', 'Science', 'History', 'Geography', 'Art', 'Music', 'Physical Education'];
