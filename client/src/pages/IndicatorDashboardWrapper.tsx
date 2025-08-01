import React from 'react';
import { useParams } from 'react-router-dom';
import { IndicatorDashboard } from './IndicatorDashboard';

export const IndicatorDashboardWrapper: React.FC = () => {
  const { indicatorCode } = useParams<{ indicatorCode: string }>();
  
  return <IndicatorDashboard indicatorCode={indicatorCode || ""} />;
};