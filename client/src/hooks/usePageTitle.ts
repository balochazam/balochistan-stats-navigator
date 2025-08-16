import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const baseTitle = 'Balochistan Bureau of Statistics - SDG Data Management';
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;
    
    return () => {
      document.title = baseTitle;
    };
  }, [title]);
}