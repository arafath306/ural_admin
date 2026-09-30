
import { ToastContext } from '@/lib/context/global/toast.context';
import Table from '@/lib/ui/useable-components/table';
import { useContext, useDeferredValue, useEffect, useState } from 'react';
import CuisineHeader from '../header/table-header';
import { useTranslations } from 'next-intl';
import { CUISINE_COLUMNS } from '@/lib/ui/useable-components/table/columns/cuisine-columns';
import { adminCuisineService } from '@/lib/supabase/services/adminCuisineService';
import { useRouter } from 'next/navigation';

export default function CuisineMain() {
  const t = useTranslations();
  const router = useRouter();
  const [cuisines, setCuisines] = useState<any[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const { showToast } = useContext(ToastContext);

  const fetchCuisines = async () => {
    setLoading(true);
    try {
      const { data, count } = await adminCuisineService.getCuisines(currentPage, rowsPerPage, deferredSearchTerm);
      setCuisines(data.map(c => ({
        _id: c.id,
        name: c.name,
        description: c.description,
        image: c.image,
        shopType: c.shop_types?.name,
      })));
      setTotalRecords(count);
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Failed to fetch cuisines') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuisines();
  }, [currentPage, rowsPerPage, deferredSearchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await adminCuisineService.deleteCuisine(id);
      showToast({ type: 'success', title: t('Success'), message: t('Cuisine deleted') });
      fetchCuisines();
    } catch (error) {
      showToast({ type: 'error', title: t('Error'), message: t('Delete failed') });
    }
  };

  return (
    <div className="p-3">
      <Table
        data={cuisines}
        setSelectedData={setSelectedCuisines}
        selectedData={selectedCuisines}
        columns={CUISINE_COLUMNS({
          handleDelete,
          onEdit: (cuisine) => router.push(`/admin/cuisines?id=${cuisine._id}`)
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
          <CuisineHeader
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
