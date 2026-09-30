'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { IZoneResponse } from '@/lib/utils/interfaces';
import ZoneHeader from '@/lib/ui/screen-components/protected/super-admin/zone/view/header/screen-header';
import ZoneMain from '@/lib/ui/screen-components/protected/super-admin/zone/view/main';
import ZoneAddForm from '@/lib/ui/screen-components/protected/super-admin/zone/form';
import { adminZoneService } from '@/lib/supabase/services/adminZoneService';
import { supabase } from '@/lib/supabase/client';

const ZonesOverviewMap = dynamic(
  () => import('@/lib/ui/useable-components/google-maps/zones-overview-map'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-dark-900 rounded-xl">
        <div className="text-center text-gray-500">
          <div className="text-3xl mb-2">🗺️</div>
          <p className="font-medium text-sm">Loading Live Zones Map...</p>
        </div>
      </div>
    ),
  }
);

export default function ZoneScreen() {
  const [isAddZoneVisible, setIsAddZoneVisible] = useState(false);
  const [zone, setZone] = useState<IZoneResponse | null>(null);
  const [allZones, setAllZones] = useState<IZoneResponse[]>([]);
  const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null);

  const fetchAllZones = useCallback(async () => {
    try {
      const data = await adminZoneService.fetchZones();
      setAllZones(data);
    } catch (err) {
      console.error('Error fetching all zones for overview map:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllZones();
  }, [fetchAllZones]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-zone-screen-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, () => {
        fetchAllZones();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllZones]);

  const onSetAddFormVisible = () => {
    setIsAddZoneVisible(true);
    setZone(null);
  };

  const handleEditZone = (selectedZone: IZoneResponse) => {
    setZone(selectedZone);
    setIsAddZoneVisible(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden p-3 gap-3">
      <ZoneHeader onSetAddFormVisible={onSetAddFormVisible} />

      {isAddZoneVisible ? (
        /* Full-page Zone Form with Map */
        <ZoneAddForm
          isAddZoneVisible={isAddZoneVisible}
          onHide={() => {
            setIsAddZoneVisible(false);
            setZone(null);
            fetchAllZones();
          }}
          zone={zone}
        />
      ) : (
        /* Split layout: Table on Left, Live Overview Map on Right */
        <div className="flex flex-1 gap-4 overflow-hidden w-full h-[calc(100vh-80px)]">
          {/* LEFT: Zone Table */}
          <div className="w-full lg:w-[480px] xl:w-[540px] flex-shrink-0 flex flex-col overflow-y-auto bg-white dark:bg-dark-950 rounded-xl border border-gray-200 dark:border-dark-600 p-4 shadow-sm">
            <ZoneMain
              setIsAddZoneVisible={(val) => {
                const nextVal = typeof val === 'function' ? val(isAddZoneVisible) : val;
                setIsAddZoneVisible(nextVal);
              }}
              setZone={(z) => {
                if (z) {
                  setFocusedZoneId(z._id || z.id);
                  handleEditZone(z);
                } else {
                  setZone(null);
                }
              }}
            />
          </div>

          {/* RIGHT: Live Map with all drawn zones visible */}
          <div className="hidden lg:flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-dark-600 shadow-sm bg-white">
            <ZonesOverviewMap
              zones={allZones}
              focusedZoneId={focusedZoneId}
              onZoneClick={(clickedZone) => {
                setFocusedZoneId(clickedZone._id || clickedZone.id);
              }}
              onEditZone={handleEditZone}
            />
          </div>
        </div>
      )}
    </div>
  );
}