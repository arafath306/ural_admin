
import { useState, useEffect } from 'react';
import Table from '@/lib/ui/useable-components/table';
import { adminCuisineService } from '@/lib/supabase/services/adminCuisineService';

export default function CuisineMain({ setIsEditing, setVisible }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCuisines = async () => {
    setLoading(true);
    try {
      const { data } = await adminCuisineService.getCuisines(1, 50);
      setData(data.map((b: any) => ({ _id: b.id, name: b.name, description: b.description })));
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCuisines(); }, []);
  const columns = [{ field: 'name', header: 'Name' }, { field: 'description', header: 'Description' }];

  return <div className="p-3"><Table data={data} columns={columns} loading={loading} selectedData={[]} setSelectedData={() => {}} /></div>;
}
