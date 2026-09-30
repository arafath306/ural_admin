
import { useState, useEffect } from 'react';
import Table from '@/lib/ui/useable-components/table';
import { adminCouponService } from '@/lib/supabase/services/adminCouponService';

export default function CouponsMain({ setIsEditing, setVisible }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await adminCouponService.getCoupons(1, 50);
      setData(data.map((b: any) => ({ _id: b.id, title: b.title, discount: b.discount, enabled: b.enabled })));
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const columns = [
    { field: 'title', header: 'Title' },
    { field: 'discount', header: 'Discount (%)' },
    { field: 'enabled', header: 'Status' },
  ];

  return (
    <div className="p-3">
      <Table data={data} columns={columns} loading={loading} selectedData={[]} setSelectedData={() => {}} />
    </div>
  );
}
