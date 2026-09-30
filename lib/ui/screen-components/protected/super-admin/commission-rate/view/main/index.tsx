
import { ToastContext } from '@/lib/context/global/toast.context';
import Table from '@/lib/ui/useable-components/table';
import { useContext, useDeferredValue, useEffect, useState } from 'react';
import CommissionRateHeader from '../header/table-header';
import { useTranslations } from 'next-intl';
import { COMMISSION_RATE_COLUMNS } from '@/lib/ui/useable-components/table/columns/comission-rate-columns';
import { adminCommissionRateService } from '@/lib/supabase/services/adminCommissionRateService';
import { COMMISSION_RATE_ACTIONS } from '@/lib/utils/constants';

export default function CommissionRateMain() {
  const t = useTranslations();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [editingRestaurantIds, setEditingRestaurantIds] = useState<Set<string>>(new Set());
  const [selectedRestaurants, setSelectedRestaurants] = useState<any[]>([]);
  const [loadingRestaurant, setLoadingRestaurant] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<'name' | 'commissionRate'>('name');
  const [sortOrder, setSortOrder] = useState<1 | -1>(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const { showToast } = useContext(ToastContext);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data, count } = await adminCommissionRateService.getCommissionRates(
        currentPage, rowsPerPage, deferredSearchTerm, sortField, sortOrder === 1 ? 'asc' : 'desc'
      );
      setRestaurants(data.map(r => ({
        _id: r.id,
        name: r.name,
        commissionRate: r.commission_rate,
      })));
      setTotalRecords(count);
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Failed to fetch commission rates') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [currentPage, rowsPerPage, deferredSearchTerm, sortField, sortOrder]);

  const handleSave = async (restaurantId: string) => {
    const restaurant = restaurants.find(r => r._id === restaurantId);
    if (!restaurant) return;
    setLoadingRestaurant(restaurantId);
    try {
      await adminCommissionRateService.updateCommissionRate(restaurantId, Number(restaurant.commissionRate));
      showToast({ type: 'success', title: t('Success'), message: t('Commission rate updated') });
      setEditingRestaurantIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(restaurantId);
        return newSet;
      });
      fetchRestaurants();
    } catch (error) {
      showToast({ type: 'error', title: t('Error'), message: t('Update failed') });
    } finally {
      setLoadingRestaurant(null);
    }
  };

  const handleCommissionRateChange = (restaurantId: string, value: number) => {
    setRestaurants(prev => prev.map(r => r._id === restaurantId ? { ...r, commissionRate: value } : r));
    setEditingRestaurantIds(prev => new Set(prev).add(restaurantId));
  };

  const getFilteredRestaurants = () => {
    if (!restaurants) return [];
    if (selectedActions.length === 0) return restaurants;
    return restaurants.filter((restaurant) => {
      return selectedActions.some((action) => {
        switch (action) {
          case COMMISSION_RATE_ACTIONS.MORE_THAN_5: return restaurant.commissionRate > 5;
          case COMMISSION_RATE_ACTIONS.MORE_THAN_10: return restaurant.commissionRate > 10;
          case COMMISSION_RATE_ACTIONS.MORE_THAN_20: return restaurant.commissionRate > 20;
          default: return false;
        }
      });
    });
  };

  return (
    <div className="p-3">
      <Table
        data={getFilteredRestaurants()}
        setSelectedData={setSelectedRestaurants}
        selectedData={selectedRestaurants}
        columns={COMMISSION_RATE_COLUMNS({ handleSave, handleCommissionRateChange, loadingRestaurant, editingRestaurantIds })}
        className="commission-rate-table"
        loading={loading}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        totalRecords={totalRecords}
        onPageChange={(page, rows) => { setCurrentPage(page); setRowsPerPage(rows); }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={(field, order) => {
          if (field !== 'name' && field !== 'commissionRate') return;
          setSortField(field);
          setSortOrder(order === -1 ? -1 : 1);
          setCurrentPage(1);
        }}
        header={
          <CommissionRateHeader
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
            onSearch={(value) => { setSearchTerm(value); setCurrentPage(1); }}
          />
        }
      />
    </div>
  );
}
