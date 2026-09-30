
import { useConfiguration } from '@/lib/hooks/useConfiguration';

import DashboardStatsTable from '@/lib/ui/useable-components/dashboard-stats-table';
import {
  IDashboardOrdersByTypeResponseGraphQL,
  IDashboardSalesByTypeResponseGraphQL,
  IQueryResult,
} from '@/lib/utils/interfaces';
import React, { useMemo } from 'react';

export default function StatesTable() {
  // COntext
  const { CURRENCY_CODE } = useConfiguration();

  const { data, loading, refetch } = { data: null, loading: false, refetch: () => {} };

  const { data: salesData, loading: salesLoading } = useQueryGQL(
    GET_DASHBOARD_SALES_BY_TYPE,
    {
      fetchPolicy: 'cache-and-network',
      debounceMs: 300,
    }
  ) as IQueryResult<
    IDashboardSalesByTypeResponseGraphQL | undefined,
    undefined
  >;

  // Memoize the data
  const dashboardOrdersByType = useMemo(() => {
    if (!data) return null;
    return data?.getDashboardOrdersByType;
  }, [data]);

  const dashboardSalesByType = useMemo(() => {
    if (!salesData) return null;
    return salesData?.getDashboardSalesByType;
  }, [salesData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 p-3 overflow-y-auto h-full">
      <DashboardStatsTable
        loading={loading}
        title="Orders"
        data={dashboardOrdersByType ?? []}
        amountConfig={{ format: 'number', currency: CURRENCY_CODE ?? 'USD' }}
      />
      <DashboardStatsTable
        loading={salesLoading}
        title="Sales"
        data={dashboardSalesByType ?? []}
        amountConfig={{ format: 'currency', currency: CURRENCY_CODE ?? 'USD' }}
      />
    </div>
  );
}
