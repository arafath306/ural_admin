import { useConfiguration } from '@/lib/hooks/useConfiguration';
import DashboardStatsTable from '@/lib/ui/useable-components/dashboard-stats-table';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import {
  adminStatsService,
  AdminDashboardStats,
} from '@/lib/supabase/services/adminStatsService';

export default function StatesTable() {
  const t = useTranslations();
  const { CURRENCY_CODE } = useConfiguration();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStatsService
      .fetchDashboardStats()
      .then((data) => setStats(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const ordersByType = [
    { label: 'Pending Orders', value: stats?.pendingOrders ?? 0 },
    { label: 'In Progress (Cooking/Assigned)', value: stats?.inProgressOrders ?? 0 },
    { label: 'Delivered Orders', value: stats?.deliveredOrders ?? 0 },
    { label: 'Cancelled Orders', value: stats?.cancelledOrders ?? 0 },
  ];

  const salesByType = [
    { label: 'Total Gross Revenue', value: stats?.totalSales ?? 0 },
    { label: 'Completed Deliveries', value: (stats?.deliveredOrders ?? 0) * 100 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 p-3">
      <DashboardStatsTable
        loading={loading}
        title={t('Orders')}
        data={ordersByType}
        amountConfig={{ format: 'number', currency: CURRENCY_CODE ?? 'BDT' }}
      />
      <DashboardStatsTable
        loading={loading}
        title={t('Sales')}
        data={salesByType}
        amountConfig={{ format: 'currency', currency: CURRENCY_CODE ?? 'BDT' }}
      />
    </div>
  );
}
