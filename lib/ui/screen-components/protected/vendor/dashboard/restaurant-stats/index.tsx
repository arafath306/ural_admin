import { useContext, useMemo } from 'react';
// Component

import StatsCard from '@/lib/ui/useable-components/stats-card';

// Hooks

import { useConfiguration } from '@/lib/hooks/useConfiguration';

// Interface & Types
import {
  IDashboardOrderStatsComponentsProps,
  IQueryResult,
  IVendorDashboardStatsCardDetailsResponseGraphQL,
} from '@/lib/utils/interfaces';

// Icons
import {
  faShoppingCart,
  faShop,
  faTruck,
} from '@fortawesome/free-solid-svg-icons';

// Context
import { VendorLayoutContext } from '@/lib/context/vendor/layout-vendor.context';
import { useTranslations } from 'next-intl';

export default function RestaurantStats({
  dateFilter,
}: IDashboardOrderStatsComponentsProps) {
  // Hooks
  const t = useTranslations();

  // Context
  const {
    vendorLayoutContextData: { vendorId },
  } = useContext(VendorLayoutContext);
  const { CURRENCY_CODE } = useConfiguration();

  const { data, loading, refetch } = { data: null, loading: false, refetch: () => {} };

  const dashboardStats = useMemo(() => {
    if (!data) return null;
    return {
      totalOrders: data?.getVendorDashboardStatsCardDetails?.totalOrders ?? 0,
      totalSales: data?.getVendorDashboardStatsCardDetails?.totalSales ?? 0,
      totalDeliveries:
        data?.getVendorDashboardStatsCardDetails?.totalDeliveries ?? 0,
      totalRestaurants:
        data?.getVendorDashboardStatsCardDetails?.totalRestaurants ?? 0,
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 items-center gap-6 p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <StatsCard
        label={t('Total Stores')}
        total={dashboardStats?.totalRestaurants ?? 0}
        icon={faShop}
        route=""
        loading={loading}
        amountConfig={{ format: 'number', currency: 'USD' }}
      />

      <StatsCard
        label={t('Total Sales')}
        total={dashboardStats?.totalSales ?? 0}
        icon={faShop}
        route=""
        loading={loading}
        amountConfig={{ format: 'currency', currency: CURRENCY_CODE ?? 'USD' }}
      />

      <StatsCard
        label={t('Total Orders')}
        total={dashboardStats?.totalOrders ?? 0}
        icon={faShoppingCart}
        route=""
        loading={loading}
        amountConfig={{ format: 'number', currency: 'USD' }}
      />

      <StatsCard
        label={t('Total Deliveries')}
        total={dashboardStats?.totalDeliveries ?? 0}
        icon={faTruck}
        route=""
        loading={loading}
        amountConfig={{ format: 'number', currency: 'USD' }}
      />
    </div>
  );
}
