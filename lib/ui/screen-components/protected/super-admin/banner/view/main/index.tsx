
import { useState, useEffect } from 'react';
import Table from '@/lib/ui/useable-components/table';
import { adminBannerService } from '@/lib/supabase/services/adminBannerService';
import BannerTableHeader from '../header/table-header';

export default function BannersMain({ setIsAddBannerVisible, setBanner }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await adminBannerService.getBanners(1, 50);
      setData(data.map((b: any) => ({ _id: b.id, title: b.title, action: b.action, screen: b.screen })));
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const columns = [
    { field: 'title', header: 'Title' },
    { field: 'action', header: 'Action' },
    { field: 'screen', header: 'Screen' },
  ];

  return (
    <div className="p-3">
      <Table
        header={<BannerTableHeader />}
        data={data}
        columns={columns}
        loading={loading}
        selectedData={[]}
        setSelectedData={() => {}}
      />
    </div>
  );
}
