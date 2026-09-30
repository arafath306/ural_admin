
'use client';
import { useState } from 'react';
import BannersAddForm from '@/lib/ui/screen-components/protected/super-admin/banner/add-form';
import BannersHeader from '@/lib/ui/screen-components/protected/super-admin/banner/view/header/screen-header';
import BannersMain from '@/lib/ui/screen-components/protected/super-admin/banner/view/main';

export default function BannerScreen() {
  const [isAddBannerVisible, setIsAddBannerVisible] = useState(false);
  const [banner, setBanner] = useState(null);
  return (
    <div className="screen-container">
      <BannersHeader setIsAddBannerVisible={setIsAddBannerVisible} />
      <BannersMain setIsAddBannerVisible={setIsAddBannerVisible} setBanner={setBanner} />
      <BannersAddForm banner={banner} onHide={() => { setIsAddBannerVisible(false); setBanner(null); }} isAddBannerVisible={isAddBannerVisible} />
    </div>
  );
}
