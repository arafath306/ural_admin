// Hooks
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import useDebounce from '@/lib/hooks/useDebounce';

// Interfaces & Types
import { IDateFilter, IExtendedOrder, IOrder } from '@/lib/utils/interfaces';

// Supabase Services
import { adminOrderService } from '@/lib/supabase/services/adminOrderService';
import { adminRestaurantService } from '@/lib/supabase/services/adminRestaurantService';
import { adminRiderService } from '@/lib/supabase/services/adminRiderService';

// Components
import OrderSuperAdminTableHeader from '../header/table-header';
import OrderDetailModal from '@/lib/ui/useable-components/popup-menu/order-details-modal';
import DashboardDateFilter from '@/lib/ui/useable-components/date-filter';
import OrderTable from '../order-table';
import { DataTablePageEvent, DataTableRowClickEvent } from 'primereact/datatable';

export default function OrderSuperAdminMain() {
  // States
  const [orders, setOrders] = useState<IExtendedOrder[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(false);

  const [selectedData, setSelectedData] = useState<IExtendedOrder[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IExtendedOrder | null>(null);

  const [dateFilter, setDateFilter] = useState<IDateFilter>({
    dateKeyword: 'All',
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
  });

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const debouncedSearch = useDebounce(globalFilterValue, 500);

  // Load restaurants and riders for filters
  useEffect(() => {
    setFiltersLoading(true);
    Promise.all([
      adminRestaurantService.fetchRestaurants(),
      adminRiderService.fetchRiders(),
    ])
      .then(([restList, riderList]) => {
        setRestaurants(
          restList.map((r) => ({
            _id: r._id,
            name: r.name,
          }))
        );
        setRiders(
          riderList.map((r) => ({
            _id: r._id,
            name: r.name,
          }))
        );
      })
      .finally(() => setFiltersLoading(false));
  }, []);

  const loadAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminOrderService.fetchAllOrders({
        page: currentPage,
        rows: rows,
        orderStatus: selectedActions.length > 0 ? selectedActions : undefined,
        search: debouncedSearch,
        restaurantId: selectedRestaurantId ?? undefined,
        riderId: selectedRiderId ?? undefined,
        starting_date: dateFilter.dateKeyword === 'Custom' ? dateFilter.startDate : undefined,
        ending_date: dateFilter.dateKeyword === 'Custom' ? dateFilter.endDate : undefined,
      });
      setOrders(res.orders);
      setTotalCount(res.totalCount);
    } catch (e) {
      console.error('Failed to load orders for super-admin:', e);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    rows,
    selectedActions,
    debouncedSearch,
    selectedRestaurantId,
    selectedRiderId,
    dateFilter,
  ]);

  useEffect(() => {
    loadAllOrders();
  }, [loadAllOrders]);

  // Real-time subscription
  useEffect(() => {
    const sub = adminOrderService.subscribeToLiveOrders(() => {
      loadAllOrders();
    });
    return () => {
      sub.unsubscribe();
    };
  }, [loadAllOrders]);

  const handleRowClick = (event: DataTableRowClickEvent) => {
    const target = event.originalEvent.target as HTMLElement | null;
    if (
      target?.closest(
        '.p-dropdown, .p-dropdown-panel, .p-inputtext, .p-checkbox, button, input, a'
      )
    ) {
      return;
    }
    setSelectedOrder(event.data as IExtendedOrder);
    setIsModalOpen(true);
  };

  const handleDateFilter = (newDateFilter: IDateFilter) => {
    setDateFilter({
      ...newDateFilter,
      dateKeyword: newDateFilter.dateKeyword ?? '',
    });
  };

  return (
    <div className="p-3">
      <DashboardDateFilter
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />
      <OrderSuperAdminTableHeader
        globalFilterValue={globalFilterValue}
        onGlobalFilterChange={(e: ChangeEvent<HTMLInputElement>) => {
          setGlobalFilterValue(e.target.value);
          setCurrentPage(1);
        }}
        selectedActions={selectedActions}
        setSelectedActions={setSelectedActions}
        selectedRestaurantId={selectedRestaurantId}
        setSelectedRestaurantId={setSelectedRestaurantId}
        selectedRiderId={selectedRiderId}
        setSelectedRiderId={setSelectedRiderId}
        dateFilter={dateFilter}
        handleDateFilter={handleDateFilter}
        restaurants={restaurants}
        riders={riders}
        filtersLoading={filtersLoading}
      />
      <OrderTable
        data={{
          orders: orders as unknown as IOrder[],
          totalCount: totalCount,
          currentPage: currentPage,
          totalPages: Math.ceil(totalCount / rows) || 1,
          prevPage: currentPage > 1 ? currentPage - 1 : null,
          nextPage: currentPage * rows < totalCount ? currentPage + 1 : null,
        }}
        loading={loading}
        isInitialLoad={false}
        handleRowClick={handleRowClick}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        first={first}
        rows={rows}
        onPage={(e: DataTablePageEvent) => {
          setFirst(e.first);
          setRows(e.rows);
          setCurrentPage(e.page ? e.page + 1 : 1);
        }}
      />
      <OrderDetailModal
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        restaurantData={selectedOrder}
        onRefresh={loadAllOrders}
        onUpdateOrder={(updated: IExtendedOrder) => setSelectedOrder(updated)}
      />
    </div>
  );
}
