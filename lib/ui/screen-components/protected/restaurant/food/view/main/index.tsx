
import { useContext, useEffect, useState, useDeferredValue } from 'react';
import Table from '@/lib/ui/useable-components/table';
import { FOOD_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/foods-columns';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import FoodTableHeader from '../header/table-header';
import { useTranslations } from 'next-intl';
import { adminFoodService } from '@/lib/supabase/services/adminFoodService';
import useToast from '@/lib/hooks/useToast';

export default function FoodMain({ setIsAddFoodVisible, setFood }: any) {
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const restaurantId = restaurantLayoutContextData?.restaurantId || '';
  const t = useTranslations();
  const { showToast } = useToast();

  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const deferredSearch = useDeferredValue(globalFilterValue);

  const fetchFoods = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const { data, count } = await adminFoodService.getFoods(restaurantId, currentPage, rowsPerPage, deferredSearch);
      setFoods(data.map(c => ({ _id: c.id, title: c.title, description: c.description, image: c.image, category: c.categories?.title })));
      setTotalRecords(count);
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Failed to fetch foods') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, [restaurantId, currentPage, rowsPerPage, deferredSearch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminFoodService.deleteFood(deleteId);
      showToast({ type: 'success', title: t('Success'), message: t('Food deleted') });
      setDeleteId('');
      fetchFoods();
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Delete failed') });
    } finally {
      setDeleting(false);
    }
  };

  const menuItems = [
    { label: t('Edit'), command: (data: any) => { if(data) { setIsAddFoodVisible(true); setFood(data); } } },
    { label: t('Delete'), command: (data: any) => { if(data) setDeleteId(data._id); } }
  ];

  return (
    <div className="p-3">
      <Table
        header={<FoodTableHeader globalFilterValue={globalFilterValue} onGlobalFilterChange={(e: any) => setGlobalFilterValue(e.target.value)} />}
        data={foods}
        setSelectedData={setSelectedFoods}
        selectedData={selectedFoods}
        loading={loading}
        columns={FOOD_TABLE_COLUMNS({ menuItems })}
        totalRecords={totalRecords}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rows) => { setCurrentPage(page); setRowsPerPage(rows); }}
      />
      <CustomDialog loading={deleting} visible={!!deleteId} onHide={() => setDeleteId('')} onConfirm={handleDelete} message={t('Are you sure?')} />
    </div>
  );
}
