import { momentLocalizer } from 'react-big-calendar';

declare module 'react-big-calendar' {
    import { ComponentType } from 'react';
    import moment from 'moment';
  
    export interface CalendarProps {
      localizer: any;
      events: Array<{
        title: string;
        start: Date;
        end: Date;
      }>;
      defaultView?: string;
      onSelectEvent?: (event: any) => void;
      onEventDrop?: (args: { event: any; start: Date; end: Date }) => void;
    }
  
    const Calendar: ComponentType<CalendarProps>;
    export { Calendar, moment };
  }