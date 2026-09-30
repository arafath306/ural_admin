
import { useContext, useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Form, Formik } from 'formik';
import { ProgressSpinner } from 'primereact/progressspinner';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomNumberField from '@/lib/ui/useable-components/number-input-field';
import useToast from '@/lib/hooks/useToast';
import { useTranslations } from 'next-intl';
import { adminAddonService } from '@/lib/supabase/services/adminAddonService';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import * as Yup from 'yup';

export default function AddonForm({ isAddAddonVisible, setIsAddAddonVisible, addon, setAddon }: any) {
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const restaurantId = restaurantLayoutContextData?.restaurantId || '';
  const { showToast } = useToast();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const isEditing = !!addon?._id;

  const closeSidebar = () => { setIsAddAddonVisible(false); setAddon(null); };

  return (
    <Sidebar visible={isAddAddonVisible} onHide={closeSidebar} position="right" className="w-full sm:w-[450px]">
      <Formik
        initialValues={{ title: addon?.title || '', description: addon?.description || '', quantityMinimum: addon?.quantityMinimum || 0, quantityMaximum: addon?.quantityMaximum || 1 }}
        validationSchema={Yup.object({ title: Yup.string().required('Required') })}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const payload = {
              title: values.title,
              description: values.description,
              quantity_minimum: values.quantityMinimum,
              quantity_maximum: values.quantityMaximum
            };
            if (isEditing) {
              await adminAddonService.updateAddon(addon._id, payload);
              showToast({ title: t('Success'), type: 'success', message: t('Updated') });
            } else {
              await adminAddonService.createAddon({ ...payload, restaurant_id: restaurantId });
              showToast({ title: t('Success'), type: 'success', message: t('Created') });
            }
            closeSidebar();
            window.location.reload();
          } catch (err: any) {
            showToast({ title: t('Error'), type: 'error', message: err.message });
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <Form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="mb-3 text-xl font-bold">{isEditing ? t('Edit') : t('Add')} {t('Addon')}</h2>
            <CustomTextField value={values.title} name="title" showLabel placeholder={t('Title')} type="text" onChange={(e) => setFieldValue('title', e.target.value)} />
            <CustomTextField value={values.description} name="description" showLabel placeholder={t('Description')} type="text" onChange={(e) => setFieldValue('description', e.target.value)} />
            <CustomNumberField value={values.quantityMinimum} name="quantityMinimum" showLabel placeholder={t('Min Qty')} onChange={setFieldValue} />
            <CustomNumberField value={values.quantityMaximum} name="quantityMaximum" showLabel placeholder={t('Max Qty')} onChange={setFieldValue} />
            <button className="float-end h-10 rounded-md bg-black px-8 text-white" disabled={loading} type="submit">
              {loading ? <ProgressSpinner className="w-6 h-6" /> : (isEditing ? t('Update') : t('Add'))}
            </button>
          </Form>
        )}
      </Formik>
    </Sidebar>
  );
}
