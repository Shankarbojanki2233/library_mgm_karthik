export class FineCalculator {
  private static readonly FINE_PER_DAY = 1; // ₹1 per day
  private static readonly LOAN_PERIOD_DAYS = 15;

  static calculateDueDate(borrowDate: string): string {
    const borrow = new Date(borrowDate);
    const due = new Date(borrow);
    due.setDate(due.getDate() + this.LOAN_PERIOD_DAYS);
    return due.toISOString().split('T')[0];
  }

  static calculateFine(dueDate: string, returnDate?: string): number {
    const due = new Date(dueDate);
    const returned = returnDate ? new Date(returnDate) : new Date();
    
    if (returned <= due) return 0;
    
    const overdueDays = Math.ceil((returned.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return overdueDays * this.FINE_PER_DAY;
  }

  static getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    
    if (today <= due) return 0;
    
    return Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  }

  static isOverdue(dueDate: string): boolean {
    return new Date() > new Date(dueDate);
  }

  static getStatusColor(dueDate: string, returnDate?: string): string {
    if (returnDate) return 'text-green-600';
    if (this.isOverdue(dueDate)) return 'text-red-600';
    
    const daysRemaining = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 3) return 'text-yellow-600';
    return 'text-blue-600';
  }
}