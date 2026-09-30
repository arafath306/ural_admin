
import { ToastContext } from '@/lib/context/global/toast.context';
import Table from '@/lib/ui/useable-components/table';
import { useContext, useDeferredValue, useEffect, useState } from 'react';
import CouponHeader from '../header/table-header';
import { useTranslations } from 'next-intl';
import { COUPON_COLUMNS } from '@/lib/ui/useable-components/table/columns/coupons-columns';
import { adminCouponService } from '@/lib/supabase/services/adminCouponService';
import { useRouter } from 'next/navigation';

export default function CouponsMain() {
  const t = useTranslations();
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const { showToast } = useContext(ToastContext);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, count } = await adminCouponService.getCoupons(currentPage, rowsPerPage, deferredSearchTerm);
      setCoupons(data.map(c => ({
        _id: c.id,
        title: c.title,
        discount: c.discount,
        type: c.discount_type,
        enabled: c.enabled,
      })));
      setTotalRecords(count);
    } catch (err) {
      showToast({ type: 'error', title: t('Error'), message: t('Failed to fetch coupons') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, rowsPerPage, deferredSearchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await adminCouponService.deleteCoupon(id);
      showToast({ type: 'success', title: t('Success'), message: t('Coupon deleted') });
      fetchCoupons();
    } catch (error) {
      showToast({ type: 'error', title: t('Error'), message: t('Delete failed') });
    }
  };

  return (
    <div className="p-3">
      <Table
        data={coupons}
        setSelectedData={setSelectedCoupons}
        selectedData={selectedCoupons}
        columns={COUPON_COLUMNS({
          handleDelete,
          onEdit: (coupon) => router.push(`/admin/coupons?id=${coupon._id}`)
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
          <CouponHeader
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
