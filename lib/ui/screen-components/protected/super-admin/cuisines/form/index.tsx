
'use client';
import { ToastContext } from '@/lib/context/global/toast.context';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import { CuisineFormSchema } from '@/lib/utils/schema/cuisine';
import { Form, Formik } from 'formik';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Sidebar } from 'primereact/sidebar';
import { useContext, useState, useEffect } from 'react';
import { onErrorMessageMatcher } from '@/lib/utils/methods';
import { CuisineErrors } from '@/lib/utils/constants';
import { useTranslations } from 'next-intl';
import { adminCuisineService } from '@/lib/supabase/services/adminCuisineService';
import { adminShopTypeService } from '@/lib/supabase/services/adminShopTypeService';
import DropdownComponent from '@/lib/ui/useable-components/custom-dropdown';

export default function CuisineForm({ setVisible, isEditing, visible, setIsEditing }: { setVisible: any, isEditing: any, visible: boolean, setIsEditing: any }) {
  const { showToast } = useContext(ToastContext);
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [shopTypes, setShopTypes] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      adminShopTypeService.getShopTypes(1, 100).then(res => {
        setShopTypes(res.data.map((s: any) => ({ label: s.name, code: s.id })));
      });
    }
  }, [visible]);

  const initialValues = {
    _id: isEditing.bool ? isEditing?.data?._id : '',
    name: isEditing.bool ? isEditing?.data?.name : '',
    description: isEditing.bool ? isEditing?.data?.description : '',
    image: isEditing.bool ? isEditing?.data?.image : '',
    shopType: isEditing.bool ? isEditing?.data?.shopType : '',
  };

  const closeSidebar = () => {
    setVisible(false);
    setIsEditing({ bool: false, data: {} });
  };

  return (
    <Sidebar visible={visible} onHide={closeSidebar} position="right" className="w-full sm:w-[450px] dark:text-white dark:bg-dark-950 border dark:border-dark-600">
      <Formik
        initialValues={initialValues}
        validationSchema={CuisineFormSchema}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const payload = {
              name: values.name,
              description: values.description,
              image: values.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
              shop_type_id: values.shopType?.code || values.shopType,
            };
            if (isEditing.bool && values._id) {
              await adminCuisineService.updateCuisine(values._id, payload);
              showToast({ title: t('Success'), type: 'success', message: t('Cuisine updated') });
            } else {
              await adminCuisineService.createCuisine(payload);
              showToast({ title: t('Success'), type: 'success', message: t('Cuisine created') });
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
              <h2 className="mb-3 text-xl font-bold">{isEditing.bool ? t('Edit') : t('Add')} {t('Cuisine')}</h2>
              <CustomTextField
                value={values.name}
                name="name"
                showLabel={true}
                placeholder={t('Name')}
                type="text"
                onChange={(e) => setFieldValue('name', e.target.value)}
                style={{ borderColor: onErrorMessageMatcher('name', errors?.name, CuisineErrors) ? 'red' : '' }}
              />
              <CustomTextField
                value={values.description}
                name="description"
                showLabel={true}
                placeholder={t('Description')}
                type="text"
                onChange={(e) => setFieldValue('description', e.target.value)}
              />
              <div className="mb-2">
                 // @ts-ignore
                 <DropdownComponent
                    options={shopTypes}
                    selectedOption={values.shopType}
                    setSelectedOption={(val) => setFieldValue('shopType', val)}
                    placeholder={t('Select Shop Type')}
                  />
              </div>
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
