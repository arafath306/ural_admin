'use client';

// Core
import { useCallback, useEffect, useState } from 'react';

// Interface and Types
import {
  IRiderResponse,
  IRidersPaginatedDataResponse,
  IRidersMainComponentsProps,
} from '@/lib/utils/interfaces/rider.interface';

// UI Components
import RidersTableHeader from '../header/table-header';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import Table from '@/lib/ui/useable-components/table';
import { RIDER_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/rider-columns';

// Utilities and Data
import { IActionMenuItem } from '@/lib/utils/interfaces/action-menu.interface';

// Hooks
import useToast from '@/lib/hooks/useToast';
import useDebounce from '@/lib/hooks/useDebounce';

// Supabase Service & Client
import { adminRiderService } from '@/lib/supabase/services/adminRiderService';
import { supabase } from '@/lib/supabase/client';

// Data
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function RidersMain({
  setIsAddRiderVisible,
  setRider,
}: IRidersMainComponentsProps) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();
  const router = useRouter();

  // State - Table
  const [deleteId, setDeleteId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<IRiderResponse[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const debouncedSearch = useDebounce(globalFilterValue, 500);

  const [data, setData] = useState<IRidersPaginatedDataResponse['ridersPaginated']>({
    data: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);

  // Fetch riders from Supabase
  const fetchRiders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminRiderService.fetchRidersPaginated({
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch || undefined,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load riders:', err);
      showToast({
        type: 'error',
        title: t('Error'),
        message: t('ActionFailedTryAgain'),
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, debouncedSearch, showToast, t]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  // Realtime updates via Supabase
  useEffect(() => {
    const channel = supabase
      .channel('admin-riders-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riders' },
        () => {
          fetchRiders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRiders]);

  // For global search
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilterValue(e.target.value);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const menuItems: IActionMenuItem<IRiderResponse>[] = [
    {
      label: t('View'),
      command: (itemData?: IRiderResponse) => {
        if (itemData) {
          router.push(`/general/riders/${itemData._id}`);
        }
      },
    },
    {
      label: t('Edit'),
      command: (itemData?: IRiderResponse) => {
        if (itemData) {
          setIsAddRiderVisible(true);
          setRider(itemData);
        }
      },
    },
    {
      label: t('Delete'),
      command: (itemData?: IRiderResponse) => {
        if (itemData) {
          setDeleteId(itemData._id);
        }
      },
    },
  ];

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setMutationLoading(true);
      await adminRiderService.deleteRider(deleteId);
      showToast({
        type: 'success',
        title: t('Success'),
        message: t('Rider Deleted'),
        duration: 3000,
      });
      setDeleteId('');
      await fetchRiders();
    } catch {
      showToast({
        type: 'error',
        title: t('Error'),
        message: t('ActionFailedTryAgain'),
      });
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <div className="p-3">
      <Table
        header={
          <RidersTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
          />
        }
        data={data?.data || []}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        loading={loading}
        columns={RIDER_TABLE_COLUMNS({ menuItems, onRefresh: fetchRiders })}
        totalRecords={data?.totalCount ?? 0}
        currentPage={data?.currentPage ?? currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rowCount) => {
          setCurrentPage(page);
          setRowsPerPage(rowCount);
        }}
      />
      <CustomDialog
        loading={mutationLoading}
        visible={!!deleteId}
        onHide={() => {
          setDeleteId('');
        }}
        onConfirm={handleDelete}
        message={t('Are you sure you want to delete this item?')}
      />
    </div>
  );
}
