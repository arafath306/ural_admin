import { IActionMenuProps, IOptions } from '@/lib/utils/interfaces';
import ActionMenu from '../../action-menu';
import { useTranslations } from 'next-intl';

const useQuery = (args: any, args2?: any): any => ({ data: null, loading: false, error: null, startPolling: () => {}, stopPolling: () => {}, refetch: () => {} });
const useMutation = (args: any, args2?: any): any => [(opts: any) => {}, { loading: false, error: null }];
class ApolloError extends Error { networkError?: any; graphQLErrors?: any[]; }
type ApolloCache<T> = any;






export const OPTION_TABLE_COLUMNS = ({
  menuItems,
}: {
  menuItems: IActionMenuProps<IOptions>['items'];
}) => {
  // Hooks
  const t = useTranslations();
  return [
    { headerName: t('Title'), propertyName: 'title' },
    { headerName: t('Price'), propertyName: 'price' },
    { headerName: t('Description'), propertyName: 'description' },
    {
      propertyName: 'actions',
      body: (option: IOptions) => (
        <ActionMenu items={menuItems} data={option} />
      ),
    },
  ];
};
