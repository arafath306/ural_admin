
import { useState, useMemo, useEffect, useDeferredValue } from 'react';
import { FilterMatchMode } from 'primereact/api';
import Table from '@/lib/ui/useable-components/table';
import WithdrawRequestTableHeader from '../header/table-header';
import { WITHDRAW_REQUESTS_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/withdraw-requests-columns';
import { IWithDrawRequest, IActionMenuProps } from '@/lib/utils/interfaces';
import { adminWithdrawRequestService } from '@/lib/supabase/services/adminWithdrawRequestService';

export default function WithdrawRequestsSuperAdminMain({
  setVisible,
  setSelectedRequest,
}: {
  setVisible: (value: boolean) => void;
  setSelectedRequest: (request: IWithDrawRequest | undefined) => void;
}) {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedData, setSelectedData] = useState<IWithDrawRequest[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({ global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS } });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [requests, setRequests] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDeferredValue(globalFilterValue);

  const selectedUserType = selectedActions.find((action) => ['RIDER', 'STORE'].includes(action));
  const selectedStatus = selectedActions.find((action) => ['REQUESTED', 'TRANSFERRED', 'CANCELLED'].includes(action));

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, count } = await adminWithdrawRequestService.getWithdrawRequests(currentPage, pageSize, debouncedSearch);
      setRequests(data.map(req => ({
        _id: req.id,
        requestAmount: req.amount,
        requestTime: req.created_at,
        status: req.status,
        rider: req.riders ? { _id: req.rider_id, name: req.riders.name, email: req.riders.email } : null,
        vendor: req.vendors ? { _id: req.vendor_id, name: req.vendors.name, email: req.vendors.email } : null,
      })));
      setTotalRecords(count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [currentPage, pageSize, debouncedSearch, selectedUserType]);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({ ...filters, global: { ...filters.global, value } });
    setGlobalFilterValue(value);
  };

  const menuItems: IActionMenuProps<IWithDrawRequest>['items'] = [
    {
      label: 'Bank Details',
      command: (data?: IWithDrawRequest) => {
        if (data) { setSelectedRequest(data); setVisible(true); }
      },
    },
  ];

  const filteredData = useMemo(() => {
    if (!requests) return [];
    let filtered = requests;
    if (selectedStatus) filtered = filtered.filter((item) => item.status === selectedStatus);
    return filtered;
  }, [requests, selectedStatus]);

  return (
    <div className="p-3">
      <Table
        header={
          <WithdrawRequestTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
          />
        }
        data={filteredData}
        filters={filters}
        setSelectedData={setSelectedData}
        selectedData={selectedData}
        loading={loading}
        columns={WITHDRAW_REQUESTS_TABLE_COLUMNS({ menuItems, currentPage, pageSize, search: debouncedSearch, selectedActions })}
        totalRecords={totalRecords}
        onPageChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
        currentPage={currentPage}
        rowsPerPage={pageSize}
      />
    </div>
  );
}
