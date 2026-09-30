'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { IExtendedOrder, Items } from '@/lib/utils/interfaces';
import './order-detail-modal.css';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { adminOrderService } from '@/lib/supabase/services/adminOrderService';
import { adminRiderService } from '@/lib/supabase/services/adminRiderService';
import useToast from '@/lib/hooks/useToast';
import { useTranslations } from 'next-intl';

interface IOrderDetailModalProps {
  visible: boolean;
  onHide: () => void;
  restaurantData: IExtendedOrder | null;
  onRefresh?: () => void;
  onUpdateOrder?: (updated: IExtendedOrder) => void;
}

const ORDER_STATUS_OPTIONS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Picked', value: 'PICKED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const OrderDetailModal: React.FC<IOrderDetailModalProps> = ({
  visible,
  onHide,
  restaurantData,
  onRefresh,
  onUpdateOrder,
}) => {
  const t = useTranslations();
  const { CURRENT_SYMBOL } = useConfiguration();
  const { showToast } = useToast();

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [ridersList, setRidersList] = useState<{ label: string; value: string }[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (restaurantData) {
      setSelectedStatus(restaurantData.orderStatus || 'PENDING');
      setSelectedRiderId(restaurantData.rider?._id || '');
    }
  }, [restaurantData]);

  useEffect(() => {
    let isMounted = true;
    if (visible) {
      adminRiderService.fetchRiders().then((list) => {
        if (isMounted) {
          setRidersList(
            list.map((r) => ({
              label: `${r.name} (${r.phone || 'No phone'})`,
              value: r.id || r._id,
            }))
          );
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [visible]);

  const calculateSubtotal = (items: Items[]) => {
    let subtotal = 0;
    for (let i = 0; i < items.length; i++) {
      let itemTotal = items[i].variation?.price ?? 0;
      if (items[i]?.addons) {
        items[i].addons?.forEach((addon) => {
          addon.options.forEach((option) => {
            itemTotal += option.price ?? 0;
          });
        });
      }
      subtotal += itemTotal * items[i].quantity;
    }
    return subtotal.toFixed(2);
  };

  const handleUpdateStatusAndRider = async () => {
    if (!restaurantData?._id) return;
    try {
      setIsUpdating(true);

      // 1. Update status if changed
      if (selectedStatus && selectedStatus !== restaurantData.orderStatus) {
        await adminOrderService.updateOrderStatus(restaurantData._id, selectedStatus);
      }

      // 2. Assign rider if changed
      if (selectedRiderId && selectedRiderId !== restaurantData.rider?._id) {
        await adminOrderService.assignRider(restaurantData._id, selectedRiderId);
      }

      showToast({
        type: 'success',
        title: t('Order Status'),
        message: t('Order updated successfully'),
        duration: 3000,
      });

      if (onRefresh) onRefresh();

      if (onUpdateOrder) {
        const selectedRiderObj = ridersList.find((r) => r.value === selectedRiderId);
        onUpdateOrder({
          ...restaurantData,
          orderStatus: selectedStatus,
          rider: selectedRiderId
            ? {
                _id: selectedRiderId,
                name: selectedRiderObj?.label.split(' (')[0] || 'Rider',
                username: 'rider',
                available: true,
              }
            : restaurantData.rider,
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: t('Error'),
        message: err?.message || t('ActionFailedTryAgain'),
        duration: 3000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!restaurantData) return null;

  const rawAddress = restaurantData.deliveryAddress as any;
  const addressText =
    rawAddress?.deliveryAddress ||
    (typeof rawAddress === 'string' ? rawAddress : 'Not specified');

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Order # ${restaurantData.orderId}`}
      className="custom-modal border border-dark-600"
      breakpoints={{ '960px': '78vw', '640px': 'calc(100vw - 16px)' }}
    >
      <div className="order-details-container dark:bg-dark-900 dark:text-white space-y-4">
        {/* Admin Action Controls Section */}
        <div className="order-section dark:bg-dark-600 border border-primary-500/20 p-4 rounded-lg bg-primary-50/10">
          <h3 className="section-header text-primary font-semibold text-base mb-3">
            Admin Management (Live Controls)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-xs font-medium block mb-1">Update Status</label>
              <Dropdown
                value={selectedStatus}
                options={ORDER_STATUS_OPTIONS}
                onChange={(e) => setSelectedStatus(e.value)}
                placeholder="Select Status"
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Assign Rider</label>
              <Dropdown
                value={selectedRiderId}
                options={ridersList}
                onChange={(e) => setSelectedRiderId(e.value)}
                placeholder="Select Rider"
                className="w-full text-sm"
                filter
              />
            </div>
            <div>
              <Button
                label="Save Updates"
                icon="pi pi-check"
                loading={isUpdating}
                onClick={handleUpdateStatusAndRider}
                className="w-full h-10 bg-black text-white hover:bg-neutral-800"
              />
            </div>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="order-section dark:bg-dark-600">
          <h3 className="section-header dark:text-primary-dark">Customer Information</h3>
          {restaurantData.user ? (
            <div className="information-grid">
              <div className="information-item">
                <span className="information-label">Name</span>
                <span>{restaurantData.user.name || 'Not available'}</span>
              </div>
              <div className="information-item">
                <span className="information-label">Phone</span>
                <span>{restaurantData.user.phone || 'Not available'}</span>
              </div>
              <div className="information-item">
                <span className="information-label">Email</span>
                <span>{restaurantData.user.email || 'Not available'}</span>
              </div>
            </div>
          ) : (
            <p>Customer information is not available</p>
          )}
        </div>

        {/* Items Section */}
        <div className="order-section dark:bg-dark-600">
          <h3 className="section-header dark:text-primary-dark">Items</h3>
          {restaurantData.items && restaurantData.items.length > 0 ? (
            <>
              <div className="item-list">
                {restaurantData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <span className="font-bold">
                      {index + 1}. {item.title}
                    </span>
                    <span className="item-price dark:text-white">
                      {item.quantity} &#215; {CURRENT_SYMBOL || '৳'}
                      {(item.variation?.price ?? 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              {restaurantData?.items?.map((item, index) => (
                <div key={index}>
                  {item?.addons?.map((addon) =>
                    addon.options.map((option, optIdx) => (
                      <div key={optIdx} className="item-row text-sm">
                        <span>{option.title}</span>
                        <span className="item-price dark:text-white">
                          {CURRENT_SYMBOL || '৳'}
                          {(option.price ?? 0).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </>
          ) : (
            <p>No items available</p>
          )}
        </div>

        {/* Charges Section */}
        <div className="order-section dark:bg-dark-600">
          <h3 className="section-header dark:text-primary-dark">Charges</h3>
          <div className="charges-table">
            <div className="charges-row">
              <span>Subtotal</span>
              <span>
                {CURRENT_SYMBOL || '৳'}
                {calculateSubtotal(restaurantData?.items || [])}
              </span>
            </div>
            <div className="charges-row">
              <span>Delivery Fee</span>
              <span>
                {CURRENT_SYMBOL || '৳'}
                {(restaurantData.deliveryCharges ?? 0)?.toFixed(2)}
              </span>
            </div>
            <div className="charges-row">
              <span>Tax Charges</span>
              <span>
                {CURRENT_SYMBOL || '৳'}
                {(restaurantData.taxationAmount ?? 0)?.toFixed(2)}
              </span>
            </div>
            <div className="charges-row">
              <span>Tip</span>
              <span>
                {CURRENT_SYMBOL || '৳'}
                {(restaurantData.tipping ?? 0)?.toFixed(2)}
              </span>
            </div>
            <div className="charges-row total-row">
              <strong>Total</strong>
              <strong>
                {CURRENT_SYMBOL || '৳'}
                {restaurantData.orderAmount}
              </strong>
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="order-section dark:bg-dark-600">
          <h3 className="section-header dark:text-primary-dark">Payment Method</h3>
          <div className="payment-section">
            <span className="payment-type">{restaurantData.paymentMethod}</span>
          </div>
          <div className="paid-amount">
            <span className="paid-label">Paid Amount</span>
            <span className="paid-value">
              {CURRENT_SYMBOL || '৳'}
              {(restaurantData.paidAmount ?? 0)?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Rider Information Section */}
        {restaurantData.rider && (
          <div className="order-section dark:bg-dark-600">
            <h3 className="section-header dark:text-primary-dark">Rider Information</h3>
            <div className="information-grid">
              <div className="information-item">
                <span className="information-label">Name</span>
                <span>{restaurantData.rider.name || 'Not available'}</span>
              </div>
              <div className="information-item">
                <span className="information-label">Username</span>
                <span>{restaurantData.rider.username || 'Not available'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address Section */}
        <div className="order-section dark:bg-dark-600">
          <h3 className="section-header dark:text-primary-dark">Delivery Address</h3>
          <p>{addressText}</p>
        </div>
      </div>
    </Dialog>
  );
};

export default OrderDetailModal;
