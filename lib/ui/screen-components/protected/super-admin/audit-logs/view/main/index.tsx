
import { ChangeEvent, useEffect, useState, useDeferredValue } from 'react';
import AuditLogTableHeader from '../header/table-header';
import Table from '@/lib/ui/useable-components/table';
import { AUDIT_LOGS_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/audit-logs-columns';
import { adminAuditLogService } from '@/lib/supabase/services/adminAuditLogService';

export default function AuditLogsMain() {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [logs, setLogs] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, count } = await adminAuditLogService.getAuditLogs(currentPage, rowsPerPage);
      setLogs(data.map(log => ({
        _id: log.id,
        action: log.action,
        performedBy: log.users ? log.users.email : 'Unknown',
        targetType: log.target_type,
        details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
        createdAt: log.created_at,
      })));
      setTotalRecords(count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [currentPage, rowsPerPage]);

  return (
    <div className="p-3">
      <Table
        columns={AUDIT_LOGS_TABLE_COLUMNS()}
        data={logs}
        selectedData={[]}
        setSelectedData={() => {}}
        header={
          <AuditLogTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={(e: any) => setGlobalFilterValue(e.target.value)}
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
          />
        }
        loading={loading}
        totalRecords={totalRecords}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, size) => { setCurrentPage(page); setRowsPerPage(size); }}
      />
    </div>
  );
}
