
import { useContext, useEffect, useState, useDeferredValue } from 'react';
import Table from '@/lib/ui/useable-components/table';
import { ADDON_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/addon-columns';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import AddonTableHeader from '../header/table-header';
import { useTranslations } from 'next-intl';
import { adminAddonService } from '@/lib/supabase/services/adminAddonService';
import useToast from '@/lib/hooks/useToast';

export default function AddonMain({ setIsAddAddonVisible, setAddon }: any) {
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const restaurantId = restaurantLayoutContextData?.restaurantId || '';
  const t = useTranslations();
  const { showToast } = useToast();

  const [addons, setAddons] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const deferredSearch = useDeferredValue(globalFilterValue);

  const fetchAddons = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const { data, count } = await adminAddonService.getAddons(restaurantId, currentPage, rowsPerPage, deferredSearch);
      setAddons(data.map(c => ({ _id: c.id, title: c.title, description: c.description })));
      setTotalRecords(count);
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Failed to fetch addons') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddons(); }, [restaurantId, currentPage, rowsPerPage, deferredSearch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminAddonService.deleteAddon(deleteId);
      showToast({ type: 'success', title: t('Success'), message: t('Addon deleted') });
      setDeleteId('');
      fetchAddons();
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Delete failed') });
    } finally {
      setDeleting(false);
    }
  };

  const menuItems = [
    { label: t('Edit'), command: (data: any) => { if(data) { setIsAddAddonVisible(true); setAddon(data); } } },
    { label: t('Delete'), command: (data: any) => { if(data) setDeleteId(data._id); } }
  ];

  return (
    <div className="p-3">
      <Table
        header={<AddonTableHeader globalFilterValue={globalFilterValue} onGlobalFilterChange={(e: any) => setGlobalFilterValue(e.target.value)} />}
        data={addons}
        setSelectedData={setSelectedAddons}
        selectedData={selectedAddons}
        loading={loading}
        columns={ADDON_TABLE_COLUMNS({ menuItems })}
        totalRecords={totalRecords}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rows) => { setCurrentPage(page); setRowsPerPage(rows); }}
      />
      <CustomDialog loading={deleting} visible={!!deleteId} onHide={() => setDeleteId('')} onConfirm={handleDelete} message={t('Are you sure?')} />
    </div>
  );
}
