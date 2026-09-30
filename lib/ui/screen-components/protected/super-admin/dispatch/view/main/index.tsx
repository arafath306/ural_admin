// Components
import Table from '@/lib/ui/useable-components/table';
import DispatchTableHeader from '../header/table-header';
import OrderDetailModal from '@/lib/ui/useable-components/popup-menu/order-details-modal';

// Interfaces
import { IActiveOrders } from '@/lib/utils/interfaces/dispatch.interface';
import { IExtendedOrder } from '@/lib/utils/interfaces';

// Hooks
import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatchOrderUI } from '@/lib/ui/useable-components/table/columns/dispatch-columns';
import { DataTableRowClickEvent } from 'primereact/datatable';

// Supabase
import {
  adminOrderService,
  mapSupabaseOrderToExtendedOrder,
} from '@/lib/supabase/services/adminOrderService';

export default function DispatchMain() {
  // States
  const [selectedData, setSelectedData] = useState<IActiveOrders[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IExtendedOrder | null>(null);

  const [orders, setOrders] = useState<IActiveOrders[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const res = await adminOrderService.fetchActiveOrders({
        page,
        rowsPerPage,
        search,
        actions: selectedActions,
      });
      setOrders(res.orders);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load active orders from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, selectedActions]);

  // Load orders on param change
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Realtime Supabase Subscription
  useEffect(() => {
    const channel = adminOrderService.subscribeToLiveOrders(() => {
      loadOrders();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [loadOrders]);

  const { columns } = useDispatchOrderUI(loadOrders);

  const handleRowClick = (event: DataTableRowClickEvent) => {
    const target = event.originalEvent.target as HTMLElement | null;
    if (
      target?.closest(
        '.p-dropdown, .p-dropdown-panel, .p-inputtext, .p-checkbox, button, input, a'
      )
    ) {
      return;
    }

    const clicked = event.data as IActiveOrders;
    setSelectedOrder(mapSupabaseOrderToExtendedOrder(clicked));
    setIsModalOpen(true);
  };

  const handleSearchChange = (val: string) => {
    setGlobalFilterValue(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  return (
    <div className="p-3">
      <DispatchTableHeader
        globalFilterValue={globalFilterValue}
        onGlobalFilterChange={(e) => handleSearchChange(e.target.value)}
        selectedActions={selectedActions}
        setSelectedActions={(acts) => {
          setSelectedActions(acts);
          setPage(1);
        }}
        search={search}
        setSearch={setSearch}
      />
      <Table
        className="dispatch-responsive-table"
        columns={columns}
        data={orders}
        loading={loading}
        selectedData={selectedData}
        setSelectedData={(e) => setSelectedData(e as IActiveOrders[])}
        rowsPerPage={rowsPerPage}
        totalRecords={totalCount}
        handleRowClick={handleRowClick}
        moduleName="SuperAdmin-Dispatch"
        onPageChange={(nextPage, rowNumber) => {
          setPage(nextPage);
          setRowsPerPage(rowNumber);
        }}
        currentPage={page}
      />

      <OrderDetailModal
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        restaurantData={selectedOrder}
        onRefresh={loadOrders}
        onUpdateOrder={(updated) => setSelectedOrder(updated)}
      />
    </div>
  );
}
