// Interfaces and Types
import { IVendorStoreDetails } from '@/lib/utils/interfaces';
import { useTranslations } from 'next-intl';

const useQuery = (args: any, args2?: any): any => ({ data: null, loading: false, error: null, startPolling: () => {}, stopPolling: () => {}, refetch: () => {} });
const useMutation = (args: any, args2?: any): any => [(opts: any) => {}, { loading: false, error: null }];
class ApolloError extends Error { networkError?: any; graphQLErrors?: any[]; }
type ApolloCache<T> = any;






export const VENDOR_STORE_DETAILS_COLUMN = () => {
  // Hooks
  const t = useTranslations();

  return [
    { headerName: t('Store Name'), propertyName: 'restaurantName' },
    {
      headerName: t('Total Orders'),
      propertyName: 'totalOrders',
      body: (store: IVendorStoreDetails) => store.totalOrders.toLocaleString(),
    },
    {
      headerName: t('Total Sales'),
      propertyName: 'totalSales',
      body: (store: IVendorStoreDetails) => `$${store.totalSales.toFixed(2)}`,
    },
    {
      headerName: t('Pickup Orders'),
      propertyName: 'pickUpCount',
      body: (store: IVendorStoreDetails) => store.pickUpCount.toLocaleString(),
    },
    {
      headerName: t('Delivery Orders'),
      propertyName: 'deliveryCount',
      body: (store: IVendorStoreDetails) =>
        store.deliveryCount.toLocaleString(),
    },
  ];
};
