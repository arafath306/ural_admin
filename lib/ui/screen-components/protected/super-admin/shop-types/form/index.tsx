
'use client';
import { ToastContext } from '@/lib/context/global/toast.context';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import { ShopTypeFormSchema } from '@/lib/utils/schema';
import { Form, Formik } from 'formik';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Sidebar } from 'primereact/sidebar';
import { useContext, useState } from 'react';
import { onErrorMessageMatcher } from '@/lib/utils/methods';
import { CuisineErrors } from '@/lib/utils/constants';
import { useTranslations } from 'next-intl';
import { adminShopTypeService } from '@/lib/supabase/services/adminShopTypeService';

export default function ShopTypeForm({ setVisible, isEditing, visible, setIsEditing }: { setVisible: any, isEditing: any, visible: boolean, setIsEditing: any }) {
  const { showToast } = useContext(ToastContext);
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    _id: isEditing.bool ? isEditing?.data?._id : '',
    name: isEditing.bool ? isEditing?.data?.name : '',
  };

  const closeSidebar = () => {
    setVisible(false);
    setIsEditing({ bool: false, data: {} });
  };

  return (
    <Sidebar visible={visible} onHide={closeSidebar} position="right" className="w-full sm:w-[450px] dark:text-white dark:bg-dark-950 border dark:border-dark-600">
      <Formik
        initialValues={initialValues}
        validationSchema={ShopTypeFormSchema}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const payload = {
              name: values.name,
            };
            if (isEditing.bool && values._id) {
              await adminShopTypeService.updateShopType(values._id, payload);
              showToast({ title: t('Success'), type: 'success', message: t('Shop type updated') });
            } else {
              await adminShopTypeService.createShopType(payload);
              showToast({ title: t('Success'), type: 'success', message: t('Shop type created') });
            }
            closeSidebar();
            window.location.reload();
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
              <h2 className="mb-3 text-xl font-bold">{isEditing.bool ? t('Edit') : t('Add')} {t('Shop Type')}</h2>
              <CustomTextField
                value={values.name}
                name="name"
                showLabel={true}
                placeholder={t('Name')}
                type="text"
                onChange={(e) => setFieldValue('name', e.target.value)}
                style={{ borderColor: onErrorMessageMatcher('name', errors?.name, CuisineErrors) ? 'red' : '' }}
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
