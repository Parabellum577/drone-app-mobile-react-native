export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  PLN = 'PLN'
}

export enum ServiceCategory {
  SERVICE = 'service',
  EVENT = 'event',
  COURSE = 'course'
}

export const CATEGORY_DESCRIPTIONS = {
  [ServiceCategory.SERVICE]: 'Services that can be booked for a specific date and time (aerial photography, inspection, training).',
  [ServiceCategory.EVENT]: 'Events with a fixed date that you can subscribe to (workshops, competitions, exhibitions).',
  [ServiceCategory.COURSE]: 'Educational programs with a schedule of classes (basic piloting course, aerial photography).'
};

export interface WorkingHours {
  from: string;
  to: string;
}

export interface EventSchedule {
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
}

export interface ServiceSchedule {
  availableDays: string[];
  workingHours: WorkingHours;
} 