
import { ToastContext } from '@/lib/context/global/toast.context';
import Table from '@/lib/ui/useable-components/table';
import { useContext, useDeferredValue, useEffect, useState } from 'react';
import ShopTypeHeader from '../header/table-header';
import { useTranslations } from 'next-intl';
import { SHOP_TYPE_COLUMNS } from '@/lib/ui/useable-components/table/columns/shop-types-columns';
import { adminShopTypeService } from '@/lib/supabase/services/adminShopTypeService';
import { useRouter } from 'next/navigation';

export default function ShopTypesMain() {
  const t = useTranslations();
  const router = useRouter();
  const [shopTypes, setShopTypes] = useState<any[]>([]);
  const [selectedShopTypes, setSelectedShopTypes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const { showToast } = useContext(ToastContext);

  const fetchShopTypes = async () => {
    setLoading(true);
    try {
      const { data, count } = await adminShopTypeService.getShopTypes(currentPage, rowsPerPage, deferredSearchTerm);
      setShopTypes(data.map(c => ({
        _id: c.id,
        name: c.name,
      })));
      setTotalRecords(count);
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Failed to fetch shop types') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopTypes();
  }, [currentPage, rowsPerPage, deferredSearchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await adminShopTypeService.deleteShopType(id);
      showToast({ type: 'success', title: t('Success'), message: t('Shop type deleted') });
      fetchShopTypes();
    } catch (error) {
      showToast({ type: 'error', title: t('Error'), message: t('Delete failed') });
    }
  };

  return (
    <div className="p-3">
      <Table
        data={shopTypes}
        setSelectedData={setSelectedShopTypes}
        selectedData={selectedShopTypes}
        columns={SHOP_TYPE_COLUMNS({
          handleDelete,
          onEdit: (shopType) => router.push(`/admin/shop-types?id=${shopType._id}`)
        })}
        loading={loading}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        totalRecords={totalRecords}
        onPageChange={(page, rows) => {
          setCurrentPage(page);
          setRowsPerPage(rows);
        }}
        header={
          // @ts-ignore
          <ShopTypeHeader
            onSearch={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
          />
        }
      />
    </div>
  );
}
