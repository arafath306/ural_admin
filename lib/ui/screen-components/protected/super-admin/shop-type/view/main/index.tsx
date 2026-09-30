
import { useState, useEffect } from 'react';
import Table from '@/lib/ui/useable-components/table';
import { adminShopTypeService } from '@/lib/supabase/services/adminShopTypeService';

export default function ShopTypeMain({ setIsEditing, setVisible }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShopTypes = async () => {
    setLoading(true);
    try {
      const { data } = await adminShopTypeService.getShopTypes(1, 50);
      setData(data.map((b: any) => ({ _id: b.id, title: b.title, description: b.description })));
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchShopTypes(); }, []);
  const columns = [{ field: 'title', header: 'Title' }, { field: 'description', header: 'Description' }];

  return <div className="p-3"><Table data={data} columns={columns} loading={loading} selectedData={[]} setSelectedData={() => {}} /></div>;
}
