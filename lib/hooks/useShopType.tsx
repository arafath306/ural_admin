import { useEffect, useState } from 'react';
import { adminShopTypeService } from '@/lib/supabase/services/adminShopTypeService';
import {
  IUserShopTypeHookProps,
  IUseShopTypesHookResponse,
} from '../utils/interfaces';

export const useShopTypes = (
  props: IUserShopTypeHookProps = {
    invoke_now: false,
    transform_to_dropdown_list: false,
  }
): IUseShopTypesHookResponse => {
  const { invoke_now, transform_to_dropdown_list } = props;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownList, setDropdownList] = useState<any[]>([]);

  const fetchShopTypes = async () => {
    setLoading(true);
    try {
      const result = await adminShopTypeService.fetchShopTypes();
      setData({ fetchShopTypes: { data: result } });
      if (transform_to_dropdown_list) {
        setDropdownList(
          result.map((st) => ({ label: st.name, code: st._id }))
        );
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (invoke_now) fetchShopTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    fetchShopTypes,
    loading,
    dropdownList,
  };
};
