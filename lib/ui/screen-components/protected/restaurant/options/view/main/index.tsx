
import { useContext, useEffect, useState, useDeferredValue } from 'react';
import Table from '@/lib/ui/useable-components/table';
import { OPTION_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/option-columns';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import OptionTableHeader from '../header/table-header';
import { useTranslations } from 'next-intl';
import { adminOptionService } from '@/lib/supabase/services/adminOptionService';
import useToast from '@/lib/hooks/useToast';

export default function OptionMain({ setIsAddOptionsVisible, setOption }: any) {
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const restaurantId = restaurantLayoutContextData?.restaurantId || '';
  const t = useTranslations();
  const { showToast } = useToast();

  const [options, setOptions] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const deferredSearch = useDeferredValue(globalFilterValue);

  const fetchOptions = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const { data, count } = await adminOptionService.getOptions(restaurantId, currentPage, rowsPerPage, deferredSearch);
      setOptions(data.map(c => ({ _id: c.id, title: c.title, description: c.description, price: c.price })));
      setTotalRecords(count);
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Failed to fetch options') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOptions(); }, [restaurantId, currentPage, rowsPerPage, deferredSearch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminOptionService.deleteOption(deleteId);
      showToast({ type: 'success', title: t('Success'), message: t('Option deleted') });
      setDeleteId('');
      fetchOptions();
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Delete failed') });
    } finally {
      setDeleting(false);
    }
  };

  const menuItems = [
    { label: t('Edit'), command: (data: any) => { if(data) { setIsAddOptionsVisible(true); setOption(data); } } },
    { label: t('Delete'), command: (data: any) => { if(data) setDeleteId(data._id); } }
  ];

  return (
    <div className="p-3">
      <Table
        header={<OptionTableHeader globalFilterValue={globalFilterValue} onGlobalFilterChange={(e: any) => setGlobalFilterValue(e.target.value)} />}
        data={options}
        setSelectedData={setSelectedOptions}
        selectedData={selectedOptions}
        loading={loading}
        columns={OPTION_TABLE_COLUMNS({ menuItems })}
        totalRecords={totalRecords}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rows) => { setCurrentPage(page); setRowsPerPage(rows); }}
      />
      <CustomDialog loading={deleting} visible={!!deleteId} onHide={() => setDeleteId('')} onConfirm={handleDelete} message={t('Are you sure?')} />
    </div>
  );
}
