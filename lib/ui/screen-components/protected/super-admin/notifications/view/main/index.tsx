
import { ChangeEvent, useEffect, useState, useDeferredValue } from 'react';
import NotificationTableHeader from '../header/table-header';
import Table from '@/lib/ui/useable-components/table';
import { NOTIFICATIONS_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/notification-columns';
import { adminNotificationService } from '@/lib/supabase/services/adminNotificationService';
import { useTranslations } from 'next-intl';

export default function NotificationMain() {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDeferredValue(globalFilterValue);
  const t = useTranslations();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, count } = await adminNotificationService.getNotifications(currentPage, rowsPerPage, debouncedSearch);
      setNotifications(data.map(n => ({
        _id: n.id,
        title: n.title,
        body: n.body,
        createdAt: n.created_at
      })));
      setTotalRecords(count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [currentPage, rowsPerPage, debouncedSearch]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

  return (
    <div className="p-3">
      <Table
        columns={NOTIFICATIONS_TABLE_COLUMNS()}
        data={notifications}
        selectedData={[]}
        setSelectedData={() => {}}
        header={
          <NotificationTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={(e: any) => setGlobalFilterValue(e.target.value)}
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
          />
        }
        loading={loading}
        totalRecords={totalRecords}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rowCount) => {
          setCurrentPage(page);
          setRowsPerPage(rowCount);
        }}
      />
    </div>
  );
}
