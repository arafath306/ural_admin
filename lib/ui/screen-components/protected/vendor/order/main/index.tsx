'use client';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Table from '@/lib/ui/useable-components/table';
import OrderTableHeader from '../header/table-header';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import { ORDER_COLUMNS } from '@/lib/ui/useable-components/table/columns/order-vendor-columns';
import OrderTableSkeleton from '@/lib/ui/useable-components/custom-skeletons/orders.vendor.row.skeleton';
import { IExtendedOrder } from '@/lib/utils/interfaces';
import { TOrderRowData } from '@/lib/utils/types';
import { DataTableRowClickEvent } from 'primereact/datatable';
import OrderDetailModal from '@/lib/ui/useable-components/popup-menu/order-details-modal';
import useDebounce from '@/lib/hooks/useDebounce';
import { adminOrderService } from '@/lib/supabase/services/adminOrderService';

export default function OrderVendorMain() {
  const [selectedData, setSelectedData] = useState<IExtendedOrder[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const restaurantId =
    restaurantLayoutContextData?.restaurantId ||
    '55555555-5555-5555-5555-555555555551';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<IExtendedOrder | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [orders, setOrders] = useState<IExtendedOrder[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await adminOrderService.fetchAllOrders({
        restaurantId,
        page: currentPage,
        rows: rowsPerPage,
        search: debouncedSearch || undefined,
        orderStatus: selectedActions.length ? selectedActions : undefined,
      });
      setOrders(res.orders);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Error fetching vendor orders:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, currentPage, rowsPerPage, debouncedSearch, selectedActions]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const sub = adminOrderService.subscribeToLiveOrders(() => {
      fetchOrders();
    });
    return () => {
      sub.unsubscribe();
    };
  }, [fetchOrders]);

  const handleRowClick = (event: DataTableRowClickEvent) => {
    const target = event.originalEvent.target as HTMLElement | null;
    if (
      target?.closest(
        '.p-dropdown, .p-dropdown-panel, .p-inputtext, .p-checkbox, button, input, a'
      )
    ) {
      return;
    }
    setSelectedRestaurant(event.data as IExtendedOrder);
    setIsModalOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const tableData: TOrderRowData[] = useMemo(() => {
    return orders.map((order) => {
      const rawAddress = order.deliveryAddress as any;
      const addrStr =
        rawAddress?.deliveryAddress ||
        (typeof rawAddress === 'string' ? rawAddress : 'Not specified');

      return {
        ...order,
        itemsTitle:
          order.items
            ?.map((item) => item.title)
            .join(', ')
            .slice(0, 15) + '...',
        OrderdeliveryAddress: addrStr.slice(0, 20) + '...',
        DateCreated: order.createdAt?.toString().slice(0, 10) || '',
      };
    });
  }, [orders]);

  const displayData: TOrderRowData[] = useMemo(() => {
    if (loading) {
      return OrderTableSkeleton({ rowCount: 10 });
    }
    return tableData;
  }, [loading, tableData]);

  return (
    <div className="p-3">
      <OrderTableHeader
        selectedActions={selectedActions}
        setSelectedActions={setSelectedActions}
        onSearch={handleSearch}
      />
      <Table
        data={displayData as IExtendedOrder[]}
        setSelectedData={setSelectedData}
        selectedData={selectedData}
        columns={ORDER_COLUMNS()}
        loading={loading}
        handleRowClick={handleRowClick}
        moduleName="Restaurant-Order"
        totalRecords={totalCount}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rowCount) => {
          setCurrentPage(page);
          setRowsPerPage(rowCount);
        }}
      />
      <OrderDetailModal
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        restaurantData={selectedRestaurant}
        onRefresh={fetchOrders}
        onUpdateOrder={(updated: IExtendedOrder) => setSelectedRestaurant(updated)}
      />
    </div>
  );
}
