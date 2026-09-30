'use client';

// Core
import Image from '@/lib/ui/useable-components/safe-image';
import { useContext, useState } from 'react';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';

// Custom Components
import CustomInputSwitch from '../../custom-input-switch';

// Interfaces
import { IActionMenuProps, IRestaurantResponse } from '@/lib/utils/interfaces';

// Supabase
import { adminStoreService } from '@/lib/supabase/services/adminStoreService';

// Components
import ActionMenu from '../../action-menu';
import { useTranslations } from 'next-intl';

export const RESTAURANT_TABLE_COLUMNS = ({
  menuItems,
  onRefresh,
}: {
  menuItems: IActionMenuProps<IRestaurantResponse>['items'];
  onRefresh?: () => void;
}) => {
  // Hooks
  const t = useTranslations();

  // Context
  const { showToast } = useContext(ToastContext);

  // State
  const [togglingRestaurant, setTogglingRestaurant] = useState<{
    id: string;
    isActive: boolean;
  }>({ id: '', isActive: false });

  // Handle checkbox change
  const onHandleRestaurantStatusChange = async (
    isActive: boolean,
    id: string
  ) => {
    try {
      setTogglingRestaurant({
        id,
        isActive,
      });
      await adminStoreService.toggleRestaurantStatus(id, !isActive);
      showToast({
        type: 'success',
        title: t('Store Status'),
        message: `${t('Store has been marked as')} ${!isActive ? t('active') : t('in-active')}`,
        duration: 2000,
      });
      if (onRefresh) {
        onRefresh();
      }
    } catch {
      showToast({
        type: 'error',
        title: t('Store Status'),
        message: t('Store Status Change Failed'),
        duration: 2000,
      });
    } finally {
      setTogglingRestaurant({
        id: '',
        isActive: false,
      });
    }
  };

  return [
    {
      headerName: t('Image'),
      propertyName: 'image',
      body: (restaurant: IRestaurantResponse) => {
        return (
          <Image
            width={30}
            height={30}
            alt={t('Store')}
            src={
              restaurant.image
                ? restaurant.image
                : 'https://images.unsplash.com/photo-1595418917831-ef942bd9f9ec?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            }
          />
        );
      },
    },
    {
      headerName: t('ID'),
      propertyName: 'unique_restaurant_id',
    },
    { headerName: t('Name'), propertyName: 'name' },
    { headerName: t('Vendor'), propertyName: 'owner.email' },
    {
      headerName: t('Email'),
      propertyName: 'username',
    },
    { headerName: t('Address'), propertyName: 'address' },
    {
      headerName: t('Status'),
      propertyName: 'actions',
      body: (rowData: IRestaurantResponse) => {
        return (
          <CustomInputSwitch
            className="prevent-row-click"
            loading={rowData?._id === togglingRestaurant?.id}
            isActive={rowData.isActive}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.stopPropagation();
              onHandleRestaurantStatusChange(rowData.isActive, rowData._id);
            }}
          />
        );
      },
    },
    {
      headerName: t('Actions'),
      propertyName: 'actions',
      body: (rowData: IRestaurantResponse) => (
        <ActionMenu items={menuItems} data={rowData} />
      ),
    },
  ];
};
