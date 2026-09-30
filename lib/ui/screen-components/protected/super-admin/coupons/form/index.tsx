
'use client';
import { ToastContext } from '@/lib/context/global/toast.context';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomNumberField from '@/lib/ui/useable-components/number-input-field';
import { IAddCouponProps } from '@/lib/utils/interfaces/coupons.interface';
import { CouponFormSchema } from '@/lib/utils/schema/coupon';
import { Form, Formik } from 'formik';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Sidebar } from 'primereact/sidebar';
import { ChangeEvent, useContext, useState } from 'react';
import CustomInputSwitch from '@/lib/ui/useable-components/custom-input-switch';
import { onErrorMessageMatcher } from '@/lib/utils/methods';
import { CouponErrors } from '@/lib/utils/constants';
import { useTranslations } from 'next-intl';
import { adminCouponService } from '@/lib/supabase/services/adminCouponService';

export default function CouponForm({ setVisible, isEditing, visible, setIsEditing }: IAddCouponProps) {
  const { showToast } = useContext(ToastContext);
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    _id: isEditing.bool ? isEditing?.data?._id : '',
    title: isEditing.bool ? isEditing?.data?.title : '',
    discount: isEditing.bool ? isEditing?.data?.discount : 0,
    enabled: isEditing.bool ? isEditing?.data?.enabled ?? true : true,
  };

  const closeSidebar = () => {
    setVisible(false);
    setIsEditing({ bool: false, data: { __typename: '', _id: '', discount: 0, enabled: true, title: '', lifeTimeActive: false, startDate: '', endDate: '' } });
  };

  return (
    <Sidebar visible={visible} onHide={closeSidebar} position="right" className="w-full sm:w-[450px] dark:text-white dark:bg-dark-950 border dark:border-dark-600">
      <Formik
        initialValues={initialValues}
        validationSchema={CouponFormSchema}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const payload = {
              title: values.title,
              discount: values.discount,
              enabled: values.enabled,
            };
            if (isEditing.bool && values._id) {
              await adminCouponService.updateCoupon(values._id, payload);
              showToast({ title: t('Success'), type: 'success', message: t('Coupon updated') });
            } else {
              await adminCouponService.createCoupon(payload);
              showToast({ title: t('Success'), type: 'success', message: t('Coupon created') });
            }
            closeSidebar();
            window.location.reload(); // Quick refresh to show data
          } catch (err: any) {
            showToast({ title: t('Error'), type: 'error', message: err.message || t('Operation failed') });
          } finally {
            setLoading(false);
          }
        }}
        validateOnChange={true}
      >
        {({ errors, handleSubmit, values, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex gap-4">
                <h2 className="mb-3 text-xl font-bold">{isEditing.bool ? t('Edit') : t('Add')} {t('Coupon')}</h2>
                <div className="flex items-center gap-x-1">
                  {values.enabled ? t('Enabled') : t('Disabled')}
                  <CustomInputSwitch
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue('enabled', e.target.checked)}
                    isActive={values.enabled}
                    className={values.enabled ? 'p-inputswitch-checked' : ''}
                  />
                </div>
              </div>
              <CustomTextField
                value={values.title}
                name="title"
                showLabel={true}
                placeholder={t('Title')}
                type="text"
                onChange={(e) => setFieldValue('title', e.target.value)}
                style={{ borderColor: onErrorMessageMatcher('title', errors?.title, CouponErrors) ? 'red' : '' }}
              />
              <CustomNumberField
                value={values.discount}
                name="discount"
                minFractionDigits={0}
                maxFractionDigits={2}
                showLabel={true}
                suffix="%"
                placeholder={t('Discount')}
                onChange={setFieldValue}
                min={0}
                max={100}
                style={{ borderColor: onErrorMessageMatcher('discount', errors?.discount, CouponErrors) ? 'red' : '' }}
              />
              <button className="float-end h-10 w-fit rounded-md border dark:border-dark-600 border-gray-300 bg-black px-8 text-white" disabled={loading} type="submit">
                {loading ? <ProgressSpinner className="m-0 h-6 w-6 items-center self-center p-0" strokeWidth="5" style={{ fill: 'white', accentColor: 'white' }} color="white" /> : (isEditing.bool ? t('Update') : t('Add'))}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Sidebar>
  );
}
