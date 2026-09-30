
'use client';
import { useState } from 'react';
import CouponAddForm from '@/lib/ui/screen-components/protected/super-admin/coupons/add-form';
import CouponsHeader from '@/lib/ui/screen-components/protected/super-admin/coupons/view/header/screen-header';
import CouponsMain from '@/lib/ui/screen-components/protected/super-admin/coupons/view/main';

export default function CouponsScreen() {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState<any>({ bool: false, data: null });
  return (
    <div className="screen-container">
      <CouponsHeader setVisible={setVisible} />
      <CouponsMain setIsEditing={setIsEditing} setVisible={setVisible} />
      <CouponAddForm visible={visible} onHide={() => { setVisible(false); setIsEditing({ bool: false, data: null }); }} isEditing={isEditing} />
    </div>
  );
}
