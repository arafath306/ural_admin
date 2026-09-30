'use client';
import { adminZoneService } from '@/lib/supabase/services/adminZoneService';
import { supabase } from '@/lib/supabase/client';

import { useCallback, useEffect, useState } from 'react';

import {
  IZoneResponse,
  IActionMenuItem,
  IZoneMainComponentsProps,
} from '@/lib/utils/interfaces';

import { useConfiguration } from '@/lib/hooks/useConfiguration';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import Table from '@/lib/ui/useable-components/table';
import RidersTableHeader from '../header/table-header';
import { ZONE_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/zone-columns';
import useToast from '@/lib/hooks/useToast';
import useDebounce from '@/lib/hooks/useDebounce';
import { useTranslations } from 'next-intl';

export default function ZoneMain({
  setIsAddZoneVisible,
  setZone,
}: IZoneMainComponentsProps) {
  const t = useTranslations();
  const { showToast } = useToast();
  const [deleteId, setDeleteId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<IZoneResponse[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const debouncedSearch = useDebounce(globalFilterValue, 500);
  const [zoneData, setZoneData] = useState<{ data: IZoneResponse[]; totalCount: number; currentPage: number; totalPages: number }>({ data: [], totalCount: 0, currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminZoneService.fetchZonesPaginated({ page: currentPage, limit: rowsPerPage, search: debouncedSearch || undefined });
      setZoneData(res as any);
    } catch (err) {
      console.error('Failed to load zones:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, debouncedSearch]);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  useEffect(() => {
    const channel = supabase.channel('admin-zones-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, () => { fetchZones(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchZones]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilterValue(e.target.value);
  };

  const menuItems: IActionMenuItem<IZoneResponse>[] = [
    {
      label: t('Edit'),
      command: (data?: IZoneResponse) => {
        if (data) {
          setIsAddZoneVisible(true);
          setZone(data);
        }
      },
    },
    {
      label: t('Delete'),
      command: (data?: IZoneResponse) => {
        if (data) {
          setDeleteId(data._id);
        }
      },
    },
  ];

  const handleDeleteZone = async () => {
    try {
      setMutationLoading(true);
      await adminZoneService.deleteZone(deleteId);
      showToast({ type: 'success', title: t('Delete Zone'), message: t('Zone has been deleted successfully'), duration: 3000 });
      setDeleteId('');
      fetchZones();
    } catch (err: any) {
      showToast({ type: 'error', title: t('Delete Zone'), message: err?.message || t('Something went wrong, Please try again') });
      setDeleteId('');
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <div className="pt-5">
      <Table
        header={
          <RidersTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
          />
        }
        data={loading ? [] : zoneData.data}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        loading={loading}
        columns={ZONE_TABLE_COLUMNS({ menuItems })}
        totalRecords={zoneData.totalCount}
        currentPage={zoneData.currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rowCount) => {
          setCurrentPage(page);
          setRowsPerPage(rowCount);
        }}
      />
      <CustomDialog
        loading={mutationLoading}
        visible={!!deleteId}
        onHide={() => { setDeleteId(''); }}
        onConfirm={() => { handleDeleteZone(); }}
        message={t('Are you sure you want to delete this item?')}
      />
    </div>
  );
}