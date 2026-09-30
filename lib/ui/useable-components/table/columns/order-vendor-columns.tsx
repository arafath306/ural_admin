import { IExtendedOrder } from '@/lib/utils/interfaces';
import { useTranslations } from 'next-intl';

const useQuery = (args: any, args2?: any): any => ({ data: null, loading: false, error: null, startPolling: () => {}, stopPolling: () => {}, refetch: () => {} });
const useMutation = (args: any, args2?: any): any => [(opts: any) => {}, { loading: false, error: null }];
class ApolloError extends Error { networkError?: any; graphQLErrors?: any[]; }
type ApolloCache<T> = any;





const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true,
};

export const ORDER_COLUMNS = () => {
  // Hooks
  const t = useTranslations();
  return [
    {
      headerName: t('Order ID'),
      propertyName: 'orderId',
    },
    {
      propertyName: 'itemsTitle',
      headerName: t('Items'),
    },
    {
      headerName: t('Payment'),
      propertyName: 'paymentMethod',
    },
    {
      headerName: t('Order Status'),
      propertyName: 'orderStatus',
    },
    {
      headerName: t('Created At'),
      propertyName: 'DateCreated',
      body: (rowData: IExtendedOrder) => {
        const formatedDate = new Date(
          Number(rowData?.createdAt)
        ).toLocaleDateString('en-US', dateOptions);
        return <span>{formatedDate}</span>;
      },
    },
    {
      headerName: t('Delivery Address'),
      propertyName: 'OrderdeliveryAddress',
    },
  ];
};
