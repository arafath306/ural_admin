
'use client';
import { useState } from 'react';
import CuisineAddForm from '@/lib/ui/screen-components/protected/super-admin/cuisines/add-form';
import CuisinesHeader from '@/lib/ui/screen-components/protected/super-admin/cuisines/view/header/screen-header';
import CuisineMain from '@/lib/ui/screen-components/protected/super-admin/cuisines/view/main';

export default function CuisineScreen() {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState<any>({ bool: false, data: null });
  return (
    <div className="screen-container">
      <CuisinesHeader setVisible={setVisible} />
      <CuisineMain setIsEditing={setIsEditing} setVisible={setVisible} />
      <CuisineAddForm visible={visible} onHide={() => { setVisible(false); setIsEditing({ bool: false, data: null }); }} isEditing={isEditing} />
    </div>
  );
}
