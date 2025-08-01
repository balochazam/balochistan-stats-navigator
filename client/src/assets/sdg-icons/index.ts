// SDG Icon exports for local asset management
import sdg1 from './sdg-1.png';
import sdg2 from './sdg-2.png';
import sdg3 from './sdg-3.png';
import sdg4 from './sdg-4.png';
import sdg5 from './sdg-5.png';
import sdg6 from './sdg-6.png';
import sdg7 from './sdg-7.png';
import sdg8 from './sdg-8.png';
import sdg9 from './sdg-9.png';
import sdg10 from './sdg-10.png';
import sdg11 from './sdg-11.png';
import sdg12 from './sdg-12.png';
import sdg13 from './sdg-13.png';
import sdg14 from './sdg-14.png';
import sdg15 from './sdg-15.png';
import sdg16 from './sdg-16.png';
import sdg17 from './sdg-17.png';

export const sdgIcons = {
  1: sdg1,
  2: sdg2,
  3: sdg3,
  4: sdg4,
  5: sdg5,
  6: sdg6,
  7: sdg7,
  8: sdg8,
  9: sdg9,
  10: sdg10,
  11: sdg11,
  12: sdg12,
  13: sdg13,
  14: sdg14,
  15: sdg15,
  16: sdg16,
  17: sdg17,
};

export function getSDGIcon(goalId: number): string {
  return sdgIcons[goalId as keyof typeof sdgIcons] || '';
}