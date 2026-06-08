import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | undefined, format: 'short' | 'long' | 'day-month' = 'short'): string {
    if (!value) return '';
    const date = new Date(value);
    switch (format) {
      case 'long':
        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'day-month':
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long'
        });
      default:
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
    }
  }
}
