
import { useContext, useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Form, Formik } from 'formik';
import { ProgressSpinner } from 'primereact/progressspinner';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import useToast from '@/lib/hooks/useToast';
import { useTranslations } from 'next-intl';
import { adminCategoryService } from '@/lib/supabase/services/adminCategoryService';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import * as Yup from 'yup';

export default function CategoryForm({ isAddCategoryVisible, setIsAddCategoryVisible, category, setCategory }: any) {
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const restaurantId = restaurantLayoutContextData?.restaurantId || '';
  const { showToast } = useToast();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const isEditing = !!category?._id;

  const closeSidebar = () => { setIsAddCategoryVisible(false); setCategory(null); };

  return (
    <Sidebar visible={isAddCategoryVisible} onHide={closeSidebar} position="right" className="w-full sm:w-[450px] dark:text-white dark:bg-dark-950 border dark:border-dark-600">
      <Formik
        initialValues={{ title: category?.title || '' }}
        validationSchema={Yup.object({ title: Yup.string().required('Required') })}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            if (isEditing) {
              await adminCategoryService.updateCategory(category._id, { title: values.title });
              showToast({ title: t('Success'), type: 'success', message: t('Category updated') });
            } else {
              await adminCategoryService.createCategory({ title: values.title, restaurant_id: restaurantId });
              showToast({ title: t('Success'), type: 'success', message: t('Category created') });
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
            <h2 className="mb-3 text-xl font-bold">{isEditing ? t('Edit') : t('Add')} {t('Category')}</h2>
            <CustomTextField value={values.title} name="title" showLabel placeholder={t('Title')} type="text" onChange={(e) => setFieldValue('title', e.target.value)} />
            <button className="float-end h-10 rounded-md bg-black px-8 text-white" disabled={loading} type="submit">
              {loading ? <ProgressSpinner className="w-6 h-6" strokeWidth="5" /> : (isEditing ? t('Update') : t('Add'))}
            </button>
          </Form>
        )}
      </Formik>
    </Sidebar>
  );
}
