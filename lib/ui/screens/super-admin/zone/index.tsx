'use client';

import React, { useState } from 'react';
import { IZoneResponse } from '@/lib/utils/interfaces';
import ZoneHeader from '@/lib/ui/screen-components/protected/super-admin/zone/view/header/screen-header';
import ZoneMain from '@/lib/ui/screen-components/protected/super-admin/zone/view/main';
import ZoneAddForm from '@/lib/ui/screen-components/protected/super-admin/zone/form';

export default function ZoneScreen() {
  const [isAddZoneVisible, setIsAddZoneVisible] = useState(false);
  const [zone, setZone] = useState<IZoneResponse | null>(null);

  const onSetAddFormVisible = () => {
    setIsAddZoneVisible(true);
    setZone(null);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden p-3">
      <ZoneHeader onSetAddFormVisible={onSetAddFormVisible} />

      {isAddZoneVisible ? (
        /* Full-page Zone Form with Map */
        <ZoneAddForm
          isAddZoneVisible={isAddZoneVisible}
          onHide={() => { setIsAddZoneVisible(false); setZone(null); }}
          zone={zone}
        />
      ) : (
        /* Zone List Table */
        <div className="flex-grow overflow-y-auto">
          <ZoneMain
            setIsAddZoneVisible={(val) => {
              setIsAddZoneVisible(typeof val === 'function' ? val(isAddZoneVisible) : val);
            }}
            setZone={setZone}
          />
        </div>
      )}
    </div>
  );
}