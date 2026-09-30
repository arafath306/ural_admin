// Components
import StatsCard from '@/lib/ui/useable-components/stats-card';

// Hooks
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

// Supabase Stats
import {
  adminStatsService,
  AdminDashboardStats,
} from '@/lib/supabase/services/adminStatsService';

// Icons
import {
  faMotorcycle,
  faStore,
  faUsers,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';

export default function UserStats() {
  const t = useTranslations();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStatsService
      .fetchDashboardStats()
      .then((data) => {
        setStats(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-3 cursor-pointer">
      <StatsCard
        label={t('Total Users')}
        total={stats?.totalOrders ? Math.max(stats.totalOrders, 1) : 1}
        description="Active customer accounts"
        icon={faUsers}
        route="/general/users"
        loading={loading}
      />
      <StatsCard
        label={t('Total Vendors')}
        total={stats?.totalRestaurants ?? 0}
        description="Registered vendor partners"
        icon={faStore}
        route="/general/vendors"
        loading={loading}
      />
      <StatsCard
        label={t('Total Stores')}
        total={stats?.totalRestaurants ?? 0}
        description="Active restaurant branches"
        icon={faUtensils}
        route="/general/stores"
        loading={loading}
      />
      <StatsCard
        label={t('Total Riders')}
        total={stats?.totalRiders ?? 0}
        description={`${stats?.onlineRiders ?? 0} riders currently online`}
        icon={faMotorcycle}
        route="/general/riders"
        loading={loading}
      />
    </div>
  );
}
