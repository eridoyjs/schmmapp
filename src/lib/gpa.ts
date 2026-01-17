import type { ResultSubject } from './types';

export function getGradePoint(mark: number): number {
  if (mark >= 80) return 5.0;
  if (mark >= 70) return 4.0;
  if (mark >= 60) return 3.5;
  if (mark >= 50) return 3.0;
  if (mark >= 40) return 2.0;
  if (mark >= 33) return 1.0;
  return 0.0;
}

export function getGradeLetter(mark: number): string {
  if (mark >= 80) return 'A+';
  if (mark >= 70) return 'A';
  if (mark >= 60) return 'A-';
  if (mark >= 50) return 'B';
  if (mark >= 40) return 'C';
  if (mark >= 33) return 'D';
  return 'F';
}

export function calculateGPA(subjects: ResultSubject[]): number {
  if (!subjects || subjects.length === 0) return 0;

  // If any subject has a failing grade (F), the final GPA is 0.
  const hasFailed = subjects.some(subject => getGradePoint(subject.mark) === 0);
  if (hasFailed) {
    return 0.0;
  }

  const totalPoints = subjects.reduce((acc, subject) => {
    return acc + getGradePoint(subject.mark);
  }, 0);

  const gpa = totalPoints / subjects.length;
  return parseFloat(gpa.toFixed(2));
}
