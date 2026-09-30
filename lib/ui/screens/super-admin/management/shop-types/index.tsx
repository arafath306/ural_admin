
'use client';
import { useState } from 'react';
import ShopTypeAddForm from '@/lib/ui/screen-components/protected/super-admin/shop-type/add-form';
import ShopTypesHeader from '@/lib/ui/screen-components/protected/super-admin/shop-type/view/header/screen-header';
import ShopTypeMain from '@/lib/ui/screen-components/protected/super-admin/shop-type/view/main';

export default function ShopTypeScreen() {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState<any>({ bool: false, data: null });
  return (
    <div className="screen-container">
      <ShopTypesHeader setVisible={setVisible} />
      <ShopTypeMain setIsEditing={setIsEditing} setVisible={setVisible} />
      <ShopTypeAddForm visible={visible} onHide={() => { setVisible(false); setIsEditing({ bool: false, data: null }); }} isEditing={isEditing} />
    </div>
  );
}
