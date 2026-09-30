// Core
import { useContext, useState } from 'react';

// Custom Components
import ActionMenu from '@/lib/ui/useable-components/action-menu';
import CustomInputSwitch from '../../custom-input-switch';

// Interfaces and Types
import { IActionMenuProps } from '@/lib/utils/interfaces/action-menu.interface';
import { IRiderResponse } from '@/lib/utils/interfaces/rider.interface';

// Supabase
import { adminRiderService } from '@/lib/supabase/services/adminRiderService';
import { ToastContext } from '@/lib/context/global/toast.context';
import { useTranslations } from 'next-intl';
import { toTextCase } from '@/lib/utils/methods';

const useQuery = (args: any, args2?: any): any => ({ data: null, loading: false, error: null, startPolling: () => {}, stopPolling: () => {}, refetch: () => {} });
const useMutation = (args: any, args2?: any): any => [(opts: any) => {}, { loading: false, error: null }];
class ApolloError extends Error { networkError?: any; graphQLErrors?: any[]; }
type ApolloCache<T> = any;






export const RIDER_TABLE_COLUMNS = ({
  menuItems,
  onRefresh,
}: {
  menuItems: IActionMenuProps<IRiderResponse>['items'];
  onRefresh?: () => void;
}) => {
  // Hooks
  const t = useTranslations();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRider, setSelectedRider] = useState<{
    id: string;
    isActive: boolean;
  }>({ id: '', isActive: false });

  const { showToast } = useContext(ToastContext);

  // Handle availability toggle
  const onHandleBannerStatusChange = async (isActive: boolean, id: string) => {
    try {
      setIsLoading(true);
      setSelectedRider({ id, isActive });
      await adminRiderService.toggleRiderAvailability(id, isActive);
      showToast({
        type: 'success',
        title: t('Status'),
        message: t('Status Changed Successfully'),
      });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('Status'),
        message: t('Status Change Failed'),
      });
    } finally {
      setSelectedRider({ id: '', isActive: false });
      setIsLoading(false);
    }
  };

  return [
    { headerName: t('Name'), propertyName: 'name' },
    { headerName: t('Username'), propertyName: 'username' },
    { headerName: t('Phone'), propertyName: 'phone' },
    {
      headerName: t('Zone'),
      propertyName: 'zone',
      body: (rider: IRiderResponse) => rider.zone?.title ?? '-',
    },
    {
      headerName: t('Vehicle Type'),
      propertyName: 'vehicleType',
      body: (rider: IRiderResponse) =>
        toTextCase(rider.vehicleType.replaceAll('_', ' '), 'title'),
    },
    {
      headerName: t('Available'),
      propertyName: 'available',
      body: (rider: IRiderResponse) => (
        <CustomInputSwitch
          loading={rider._id === selectedRider.id && isLoading}
          isActive={rider.available}
          onChange={async () => {
            if (isLoading) return;
            await onHandleBannerStatusChange(!rider.available, rider._id);
          }}
        />
      ),
    },
    {
      propertyName: 'actions',
      body: (rider: IRiderResponse) => (
        <ActionMenu items={menuItems} data={rider} />
      ),
    },
  ];
};
