'use client';

// React & Hooks
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

// Interfaces & Service
import { ISingleRiderResponse } from '@/lib/utils/interfaces';
import { adminRiderService } from '@/lib/supabase/services/adminRiderService';

// UI Components
import BankDetails from '@/lib/ui/screen-components/protected/super-admin/riders/view/cards/bank-details';
import LicenseDetails from '@/lib/ui/screen-components/protected/super-admin/riders/view/cards/license-details';
import PersonalDetails from '@/lib/ui/screen-components/protected/super-admin/riders/view/cards/personal-details';
import VehicleDetails from '@/lib/ui/screen-components/protected/super-admin/riders/view/cards/vehicle-details';
import HeaderText from '@/lib/ui/useable-components/header-text';

export default function RidersDetailScreen() {
  // Hooks
  const t = useTranslations();
  const { id } = useParams();

  // State
  const [rider, setRider] = useState<ISingleRiderResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      adminRiderService.fetchRiderById(id.toString()).then((res) => {
        if (isMounted) {
          setRider(res || undefined);
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="screen-container p-3">
      <HeaderText className="heading" text={t('rider_information')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* top-left */}
        <PersonalDetails loading={loading} rider={rider} />
        {/* top-right */}
        <BankDetails loading={loading} rider={rider} />
        {/* bottom-left */}
        <LicenseDetails loading={loading} rider={rider} />
        {/* bottom-right */}
        <VehicleDetails loading={loading} rider={rider} />
      </div>
    </div>
  );
}
