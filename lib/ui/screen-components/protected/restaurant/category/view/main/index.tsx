
import { useContext, useEffect, useState, useDeferredValue } from 'react';
import Table from '@/lib/ui/useable-components/table';
import { CATEGORY_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/category-columns';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import CategoryTableHeader from '../header/table-header';
import { useTranslations } from 'next-intl';
import { adminCategoryService } from '@/lib/supabase/services/adminCategoryService';
import useToast from '@/lib/hooks/useToast';

export default function CategoryMain({ setIsAddCategoryVisible, setCategory }: any) {
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const restaurantId = restaurantLayoutContextData?.restaurantId || '';
  const t = useTranslations();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const deferredSearch = useDeferredValue(globalFilterValue);

  const fetchCategories = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const { data, count } = await adminCategoryService.getCategories(restaurantId, currentPage, rowsPerPage, deferredSearch);
      setCategories(data.map(c => ({ _id: c.id, title: c.title })));
      setTotalRecords(count);
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Failed to fetch categories') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, [restaurantId, currentPage, rowsPerPage, deferredSearch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminCategoryService.deleteCategory(deleteId);
      showToast({ type: 'success', title: t('Success'), message: t('Category deleted') });
      setDeleteId('');
      fetchCategories();
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Delete failed') });
    } finally {
      setDeleting(false);
    }
  };

  const menuItems = [
    { label: t('Edit'), command: (data: any) => { if(data) { setIsAddCategoryVisible(true); setCategory(data); } } },
    { label: t('Delete'), command: (data: any) => { if(data) setDeleteId(data._id); } }
  ];

  return (
    <div className="p-3">
      <Table
        header={<CategoryTableHeader globalFilterValue={globalFilterValue} onGlobalFilterChange={(e: any) => setGlobalFilterValue(e.target.value)} />}
        data={categories}
        setSelectedData={setSelectedCategories}
        selectedData={selectedCategories}
        loading={loading}
        columns={CATEGORY_TABLE_COLUMNS({ menuItems })}
        totalRecords={totalRecords}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rows) => { setCurrentPage(page); setRowsPerPage(rows); }}
      />
      <CustomDialog
        loading={deleting}
        visible={!!deleteId}
        onHide={() => setDeleteId('')}
        onConfirm={handleDelete}
        message={t('Are you sure you want to delete this category?')}
      />
    </div>
  );
}
