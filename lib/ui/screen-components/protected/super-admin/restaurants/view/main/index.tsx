'use client';

// Core
import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// PrimeReact
import { FilterMatchMode } from 'primereact/api';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';
import { RestaurantsContext } from '@/lib/context/super-admin/restaurants.context';

// Custom Hooks
import useDebounce from '@/lib/hooks/useDebounce';

// Custom Components
import RestaurantDuplicateDialog from '../duplicate-dialog';
import RestaurantsTableHeader from '../header/table-header';
import Table from '@/lib/ui/useable-components/table';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';

// Constants and Interfaces
import {
  IActionMenuItem,
  IRestaurantResponse,
  IPaginatedRestaurantResponse,
} from '@/lib/utils/interfaces';

// Supabase Service & Client
import { adminStoreService } from '@/lib/supabase/services/adminStoreService';
import { supabase } from '@/lib/supabase/client';

// Method
import { onUseLocalStorage } from '@/lib/utils/methods';

// Dummy
import { DataTableRowClickEvent } from 'primereact/datatable';
import { useTranslations } from 'next-intl';
import { RESTAURANT_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/restaurant-column';

export default function RestaurantsMain() {
  // Hooks
  const t = useTranslations();

  // Context
  const { showToast } = useContext(ToastContext);
  const { currentTab } = useContext(RestaurantsContext);

  // Hooks
  const router = useRouter();

  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState('');
  const [duplicateId, setDuplicateId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<IRestaurantResponse[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isHardDeleting, setIsHardDeleting] = useState(false);

  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(globalFilterValue, 500);

  const [restaurantData, setRestaurantData] = useState<IPaginatedRestaurantResponse>({
    data: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  const filters = {
    global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS },
    action: {
      value: selectedActions.length > 0 ? selectedActions : null,
      matchMode: FilterMatchMode.IN,
    },
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, currentTab]);

  // Fetch stores from Supabase
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminStoreService.fetchRestaurantsPaginated({
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearchTerm || undefined,
        tab: currentTab,
      });
      setRestaurantData(res);
    } catch (err) {
      console.error('Failed to load stores:', err);
      showToast({
        type: 'error',
        title: t('Error'),
        message: t('ActionFailedTryAgain'),
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, debouncedSearchTerm, currentTab, showToast, t]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Realtime updates via Supabase
  useEffect(() => {
    const channel = supabase
      .channel('admin-stores-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurants' },
        () => {
          fetchStores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStores]);

  const handleDelete = async (id: string) => {
    try {
      setIsHardDeleting(true);
      await adminStoreService.deleteRestaurant(id);
      showToast({
        type: 'success',
        title: t('Store Delete'),
        message: t('Store has been deleted successfully'),
        duration: 2000,
      });
      setDeleteId('');
      await fetchStores();
    } catch {
      showToast({
        type: 'error',
        title: t('Store Delete'),
        message: t('Store delete failed'),
      });
      setDeleteId('');
    } finally {
      setIsHardDeleting(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number, rows: number) => {
    setCurrentPage(page);
    setRowsPerPage(rows);
  };

  // Constants
  const menuItems: IActionMenuItem<IRestaurantResponse>[] = [
    {
      label: t('View'),
      command: (data?: IRestaurantResponse) => {
        if (data) {
          onUseLocalStorage('save', 'restaurantId', data?._id);
          onUseLocalStorage('save', 'shopType', data?.shopType);
          const routeStack = ['Admin'];
          onUseLocalStorage('save', 'routeStack', JSON.stringify(routeStack));
          router.push(`/admin/store/`);
        }
      },
    },
    {
      label: t('Duplicate'),
      command: (data?: IRestaurantResponse) => {
        if (data) {
          setDuplicateId(data._id);
        }
      },
    },
    {
      label: t('Delete'),
      command: (data?: IRestaurantResponse) => {
        if (data) {
          setDeleteId(data._id);
        }
      },
    },
  ];

  const restaurants = restaurantData?.data || [];
  const totalRecords = restaurantData?.totalCount || 0;

  return (
    <div className="p-3">
      <Table
        header={
          <RestaurantsTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={(e) => setGlobalFilterValue(e.target.value)}
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
          />
        }
        data={loading ? [] : restaurants}
        filters={filters}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        columns={RESTAURANT_TABLE_COLUMNS({ menuItems, onRefresh: fetchStores })}
        loading={loading}
        rowsPerPage={rowsPerPage}
        totalRecords={totalRecords}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        handleRowClick={(event: DataTableRowClickEvent) => {
          const target = event.originalEvent.target as HTMLElement | null;

          if (target?.closest('.prevent-row-click')) {
            return;
          }

          onUseLocalStorage('save', 'restaurantId', event.data._id);
          onUseLocalStorage('save', 'shopType', event.data.shopType);
          const routeStack = ['Admin'];
          onUseLocalStorage('save', 'routeStack', JSON.stringify(routeStack));
          router.push(`/admin/store/`);
        }}
      />

      <CustomDialog
        loading={isHardDeleting}
        visible={!!deleteId}
        onHide={() => {
          setDeleteId('');
        }}
        onConfirm={() => {
          handleDelete(deleteId);
        }}
        message={t('Are you sure you want to delete this store?')}
      />

      <RestaurantDuplicateDialog
        restaurantId={duplicateId}
        visible={!!duplicateId}
        onHide={() => {
          setDuplicateId('');
        }}
      />
    </div>
  );
}
