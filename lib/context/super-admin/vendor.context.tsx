'use client';
import { GET_VENDORS, useQueryGQL } from '@/lib/api/graphql';

// Core
import { createContext, useCallback, useEffect, useState } from 'react';
// Interfaces and Types
import {
  IProvider,
  IQueryResult,
  IVendorContextProps,
  IVendorReponse,
  IVendorResponseGraphQL,
} from '@/lib/utils/interfaces';

// Supabase Service
import { adminVendorService } from '@/lib/supabase/services/adminVendorService';

// Methods
import { onFilterObjects, onUseLocalStorage } from '@/lib/utils/methods';
import { SELECTED_VENDOR_EMAIL } from '@/lib/utils/constants';

export const VendorContext = createContext<IVendorContextProps>(
  {} as IVendorContextProps
);

export const VendorProvider = ({ children }: IProvider) => {
  // States
  const [vendorFormVisible, setVendorFormVisible] = useState<boolean>(false);
  const [filtered, setFiltered] = useState<IVendorReponse[]>();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [isEditingVendor, setIsEditing] = useState<boolean>(false);
  const [isReset, setIsReset] = useState<boolean>(false);
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch Vendors from Supabase
  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      const vendors = await adminVendorService.fetchVendors();
      setVendorList(vendors);
      setFiltered(vendors);
      if (vendors.length > 0) {
        setVendorId(vendors[0]._id);
        onUseLocalStorage('save', SELECTED_VENDOR_EMAIL, vendors[0].email);
      }
    } catch (err) {
      console.error('Failed to load vendors in context:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const vendorResponse: any = {
    data: { vendors: vendorList },
    loading,
    refetch: loadVendors,
  };

  // State Handler
  const onSetVendorFormVisible = (status: boolean, isEdit?: boolean) => {
    setVendorFormVisible(status);

    if (isEdit !== undefined) {
      setIsEditing(isEdit);
    }
  };
  const onSetVendorId = (id: string) => {
    setVendorId(id);
  };

  const onSetGlobalFilter = (filter: string) => {
    setGlobalFilter(filter);
  };

  const onSetEditingVendor = (status: boolean) => {
    setIsEditing(status);
  };

  const onResetVendor = (state: boolean) => {
    setIsReset(state);
  };

  // Data Handler
  const onHandlerFilterData = () => {
    const _filtered: IVendorReponse[] = onFilterObjects(
      vendorList,
      globalFilter,
      ['name', 'email', 'userType', 'unique_id']
    );

    setVendorId(_filtered[0]?._id ?? '');
    setFiltered(_filtered);
  };

  // Use Effect
  useEffect(() => {
    if (vendorList && vendorList.length > 0) {
      onHandlerFilterData();
    }
  }, [vendorList, globalFilter]);

  const value: IVendorContextProps = {
    vendorFormVisible,
    onSetVendorFormVisible,
    vendorId,
    onSetVendorId,
    // Vendors Data
    vendorResponse,
    // Filter
    globalFilter,
    onSetGlobalFilter,
    filtered,
    // Editing
    isEditingVendor,
    onSetEditingVendor,
    // Reset
    onResetVendor,
  };

  return (
    <VendorContext.Provider value={value}>{children}</VendorContext.Provider>
  );
};
