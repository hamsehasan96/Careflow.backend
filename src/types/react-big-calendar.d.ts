// This file contains type declarations for the project
declare module 'react-big-calendar' {
  import { ComponentType } from 'react';
  
  export interface CalendarProps {
    localizer: any;
    events: any[];
    startAccessor: string;
    endAccessor: string;
    style?: object;
    view?: string;
    date?: Date;
    onNavigate?: (date: Date) => void;
    onView?: (view: string) => void;
    onSelectEvent?: (event: any) => void;
    onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
    selectable?: boolean;
    eventPropGetter?: (event: any) => { style: object };
  }
  
  export const Calendar: ComponentType<CalendarProps>;
  export const momentLocalizer: any;
}
