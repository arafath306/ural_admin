// Interfaces
import { IActiveOrders } from '@/lib/utils/interfaces/dispatch.interface';
import { IDropdownSelectItem } from '@/lib/utils/interfaces';
import { IColumnConfig } from '@/lib/utils/interfaces/table.interface';

// Prime React
import { Tag } from 'primereact/tag';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

// Hooks & Context
import { useContext, useEffect, useMemo, useState } from 'react';
import { ToastContext } from '@/lib/context/global/toast.context';
import { useTranslations } from 'next-intl';

// Supabase Services
import { adminOrderService } from '@/lib/supabase/services/adminOrderService';
import { adminRiderService } from '@/lib/supabase/services/adminRiderService';

// CSS
import classes from '@/lib/ui/screen-components/protected/super-admin/dispatch/view/main/index.module.css';

const valueTemplate = (option: IDropdownSelectItem) => (
  <div className="flex items-center justify-start gap-2 dark:text-white">
    <Tag severity={severityChecker(option?.code)} value={option?.label} rounded />
  </div>
);

const itemTemplate = (option: IDropdownSelectItem) => {
  return (
    <div
      className={`flex flex-row-reverse items-center justify-start gap-2 ${classes.dropDownItem} ${
        option.disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <span>{option.label}</span>
    </div>
  );
};

function severityChecker(status: string | undefined) {
  switch (status) {
    case 'PENDING':
      return 'danger';
    case 'ACCEPTED':
      return 'warning';
    case 'READY':
      return 'info';
    case 'ASSIGNED':
      return 'info';
    case 'PICKED':
      return 'contrast';
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    default:
      return undefined;
  }
}

export const useDispatchOrderUI = (onStatusOrRiderUpdated?: () => void) => {
  const t = useTranslations();
  const { showToast } = useContext(ToastContext);

  const actionStatusOptions = useMemo(
    () => [
      { label: t('PENDING'), code: 'PENDING' },
      { label: t('ACCEPTED'), code: 'ACCEPTED' },
      { label: 'READY', code: 'READY' },
      { label: t('ASSIGNED'), code: 'ASSIGNED' },
      { label: t('PICKED'), code: 'PICKED' },
      { label: t('DELIVERED'), code: 'DELIVERED' },
      { label: t('CANCELLED'), code: 'CANCELLED' },
    ],
    [t]
  );

  const [riderOptions, setRiderOptions] = useState<IDropdownSelectItem[]>([]);
  const [isRiderLoading, setIsRiderLoading] = useState({
    _id: '',
    orderId: '',
    bool: false,
  });
  const [isStatusUpdating, setIsStatusUpdating] = useState({
    _id: '',
    bool: false,
  });

  // Fetch live riders from Supabase
  const loadRiders = async () => {
    try {
      const riders = await adminRiderService.fetchRiders();
      setRiderOptions(
        riders.map((rider) => ({
          label: rider.name + (rider.is_online ? ' (Online)' : ''),
          code: rider.name.toUpperCase(),
          _id: rider._id,
        }))
      );
    } catch (err) {
      console.error('Failed to load riders for dispatch:', err);
    }
  };

  useEffect(() => {
    loadRiders();
  }, []);

  const handleAssignRider = async (
    item: IDropdownSelectItem,
    rowData: IActiveOrders
  ) => {
    if (!item._id) return;

    setIsRiderLoading({
      _id: item._id,
      bool: true,
      orderId: rowData._id,
    });

    try {
      const success = await adminOrderService.assignRider(rowData._id, item._id);
      if (success) {
        showToast({
          type: 'success',
          title: t('Assign Rider'),
          message: `${t('The order')} ${rowData.orderId} ${t(
            'has been successfully assigned to rider'
          )} ${item.label}`,
        });
        if (onStatusOrRiderUpdated) onStatusOrRiderUpdated();
      } else {
        showToast({
          type: 'error',
          title: t('Assign Rider'),
          message: t('An error occured while assigning the job to rider'),
        });
      }
    } catch {
      showToast({
        type: 'error',
        title: t('Assign Rider'),
        message: t('An error occured while assigning the job to rider'),
      });
    } finally {
      setIsRiderLoading({
        _id: '',
        orderId: '',
        bool: false,
      });
    }
  };

  const handleStatusDropDownChange = async (
    e: DropdownChangeEvent,
    rowData: IActiveOrders
  ) => {
    setIsStatusUpdating({
      _id: rowData._id,
      bool: true,
    });

    try {
      const success = await adminOrderService.updateOrderStatus(
        rowData._id,
        e.value.code
      );
      if (success) {
        showToast({
          type: 'success',
          title: t('Order Status'),
          message: t('Order status has been updated successfully'),
        });
        if (onStatusOrRiderUpdated) onStatusOrRiderUpdated();
      } else {
        showToast({
          type: 'error',
          title: t('Order Status'),
          message: t('Something went wrong'),
        });
      }
    } catch {
      showToast({
        type: 'error',
        title: t('Order Status'),
        message: t('Something went wrong'),
      });
    } finally {
      setIsStatusUpdating({
        _id: rowData._id,
        bool: false,
      });
    }
  };

  const OrderFlowLabel = ({ rowData }: { rowData: IActiveOrders }) => {
    return <p>{rowData.isPickedUp === false ? t('Delivery') : t('Pick Up')}</p>;
  };

  const renderEta = (rowData: IActiveOrders) => {
    return (
      <div className="flex flex-col whitespace-nowrap">
        <span className="font-medium">{rowData.preparationTime || '20 mins'}</span>
        <span className="text-xs text-gray-500">Live Supabase</span>
      </div>
    );
  };

  const renderRiderField = (rowData: IActiveOrders) => {
    const selectedRider: IDropdownSelectItem = {
      label: rowData?.rider?.name?.toString() ?? '',
      code: rowData?.rider?.name?.toString().toUpperCase() ?? '',
      _id: rowData?.rider?._id?.toString() ?? '',
    };

    if (rowData._id && !rowData.isPickedUp) {
      return (
        <Dropdown
          options={riderOptions}
          loading={
            isRiderLoading._id === selectedRider._id &&
            isRiderLoading.bool === true &&
            isRiderLoading.orderId === rowData._id
          }
          value={selectedRider._id ? selectedRider : undefined}
          optionLabel="label"
          placeholder={t('Select Rider')}
          onChange={(e: DropdownChangeEvent) =>
            handleAssignRider(e.value, rowData)
          }
          className="min-w-[140px] outline outline-1 outline-gray-600"
        />
      );
    }

    return (
      <Dropdown
        options={[
          {
            code: 'Pickup',
            label: t('Pickup'),
          },
        ]}
        value={{
          code: 'Pickup',
          label: t('Pickup'),
        }}
        optionLabel="label"
        dropdownIcon={() => <></>}
        disabled
        className="min-w-[140px] outline outline-1 outline-gray-600"
      />
    );
  };

  const renderStatusField = (rowData: IActiveOrders) => {
    const availableStatuses = actionStatusOptions.map((status) => ({
      ...status,
      disabled: false,
    }));

    const currentStatus = availableStatuses.find(
      (status) => status.code === (rowData?.orderStatus || 'PENDING')
    );

    return (
      <Dropdown
        value={currentStatus}
        onChange={(e) => handleStatusDropDownChange(e, rowData)}
        options={availableStatuses}
        optionLabel="label"
        itemTemplate={itemTemplate}
        valueTemplate={valueTemplate}
        loading={isStatusUpdating.bool && isStatusUpdating._id === rowData._id}
        className="outline outline-1 outline-gray-300"
        disabled={rowData.orderStatus === 'DELIVERED'}
      />
    );
  };

  const columns: IColumnConfig<IActiveOrders>[] = [
    {
      propertyName: 'orderId',
      headerName: t('Order Id'),
    },
    {
      propertyName: 'deliveryAddress.deliveryAddress',
      headerName: t('Order Information'),
      body: (rowData: IActiveOrders) => <OrderFlowLabel rowData={rowData} />,
    },
    {
      propertyName: 'restaurant.name',
      headerName: t('Store'),
    },
    {
      propertyName: 'paymentMethod',
      headerName: t('Payment'),
    },
    {
      propertyName: 'user.name',
      headerName: t('Customer'),
    },
    {
      propertyName: 'user.phone',
      headerName: t('Phone'),
    },
    {
      propertyName: 'rider.name',
      headerName: t('Rider'),
      body: (rowData: IActiveOrders) => renderRiderField(rowData),
    },
    {
      propertyName: 'createdAt',
      headerName: t('Order Time'),
      body: (rowData: IActiveOrders) => (
        <span>
          {new Date(rowData.createdAt).toLocaleDateString() +
            ', ' +
            new Date(rowData.createdAt).toLocaleTimeString()}
        </span>
      ),
    },
    {
      propertyName: 'orderStatus',
      headerName: t('Status'),
      body: (rowData: IActiveOrders) => renderStatusField(rowData),
    },
    {
      propertyName: 'eta',
      headerName: 'Prep Time',
      body: (rowData: IActiveOrders) => renderEta(rowData),
    },
  ];

  return {
    columns,
    renderOrderFlowLabel: (rowData: IActiveOrders) => (
      <OrderFlowLabel rowData={rowData} />
    ),
    renderRiderField,
    renderStatusField,
  };
};
