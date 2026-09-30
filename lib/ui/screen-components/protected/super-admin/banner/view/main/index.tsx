
import { ToastContext } from '@/lib/context/global/toast.context';
import Table from '@/lib/ui/useable-components/table';
import { useContext, useDeferredValue, useEffect, useState } from 'react';
import BannerHeader from '../header/table-header';
import { useTranslations } from 'next-intl';
import { BANNER_COLUMNS } from '@/lib/ui/useable-components/table/columns/banners-columns';
import { adminBannerService } from '@/lib/supabase/services/adminBannerService';
import { useRouter } from 'next/navigation';

export default function BannerMain() {
  const t = useTranslations();
  const router = useRouter();
  const [banners, setBanners] = useState<any[]>([]);
  const [selectedBanners, setSelectedBanners] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const { showToast } = useContext(ToastContext);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, count } = await adminBannerService.getBanners(currentPage, rowsPerPage, deferredSearchTerm);
      setBanners(data.map(c => ({
        _id: c.id,
        title: c.title,
        description: c.description,
        action: c.action,
        screen: c.screen,
        file: c.file,
      })));
      setTotalRecords(count);
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Failed to fetch banners') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [currentPage, rowsPerPage, deferredSearchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await adminBannerService.deleteBanner(id);
      showToast({ type: 'success', title: t('Success'), message: t('Banner deleted') });
      fetchBanners();
    } catch (error) {
      showToast({ type: 'error', title: t('Error'), message: t('Delete failed') });
    }
  };

  return (
    <div className="p-3">
      <Table
        data={banners}
        setSelectedData={setSelectedBanners}
        selectedData={selectedBanners}
        columns={BANNER_COLUMNS({
          handleDelete,
          onEdit: (banner) => router.push(`/admin/banner?id=${banner._id}`)
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
          <BannerHeader
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
