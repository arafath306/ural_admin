// Components
import { INotification } from '@/lib/utils/interfaces/notification.interface';
import CustomButton from '../../button';

// Hooks
import { useContext, useMemo } from 'react';


// GrahpQL


// Contexts
import { ToastContext } from '@/lib/context/global/toast.context';
import { useTranslations } from 'next-intl';

const useQuery = (args: any, args2?: any): any => ({ data: null, loading: false, error: null, startPolling: () => {}, stopPolling: () => {}, refetch: () => {} });
const useMutation = (args: any, args2?: any): any => [(opts: any) => {}, { loading: false, error: null }];
class ApolloError extends Error { networkError?: any; graphQLErrors?: any[]; }
type ApolloCache<T> = any;






export const NOTIFICATIONS_TABLE_COLUMNS = () => {
  // Hooks
  const t = useTranslations();
  const { showToast } = useContext(ToastContext);

  // Mutations
  const [sendNotificationUser, { loading }] = useMutation(
    "",
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          title: t('Resend Notification'),
          message: t('The notification has been resent successfully'),
        });
      },
      onError: (err: any) => {
        showToast({
          type: 'error',
          title: t('Resend Notification'),
          message:
            err?.cause?.message ||
            t('An error occured while resending the notification'),
        });
      },
      refetchQueries: [{ query: "" }],
    }
  );

  // Handlers
  async function handleResendNotification(rowData: INotification) {
    await sendNotificationUser({
      variables: {
        notificationTitle: rowData.title,
        notificationBody: rowData.body,
      },
    });
  }

  // Columns
  const notification_columns = useMemo(
    () => [
      {
        headerName: t('Title'),
        propertyName: 'title',
      },
      {
        headerName: t('Description'),
        propertyName: 'body',
      },
      {
        headerName: t('Date'),
        propertyName: 'createdAt',
        body: (rowData: INotification) => {
          return <span>{rowData.createdAt}</span>;
        },
      },
      {
        headerName: t('Change Status'),
        propertyName: 'status',
        body: (rowData: INotification) => (
          <CustomButton
            onClick={() => handleResendNotification(rowData)}
            label="Resend"
            loading={loading}
            type="button"
            className="block self-end"
          />
        ),
      },
    ],
    []
  );
  return notification_columns;
};
