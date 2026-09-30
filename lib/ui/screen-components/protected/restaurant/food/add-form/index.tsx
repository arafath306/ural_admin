
import { useContext, useState, useEffect } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Form, Formik } from 'formik';
import { ProgressSpinner } from 'primereact/progressspinner';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import DropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import useToast from '@/lib/hooks/useToast';
import { useTranslations } from 'next-intl';
import { adminFoodService } from '@/lib/supabase/services/adminFoodService';
import { adminCategoryService } from '@/lib/supabase/services/adminCategoryService';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import * as Yup from 'yup';

export default function FoodForm({ isAddFoodVisible, setIsAddFoodVisible, food, setFood }: any) {
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const restaurantId = restaurantLayoutContextData?.restaurantId || '';
  const { showToast } = useToast();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const isEditing = !!food?._id;

  useEffect(() => {
    if (isAddFoodVisible && restaurantId) {
      adminCategoryService.getCategories(restaurantId, 1, 100).then(res => {
        setCategories(res.data.map((c: any) => ({ label: c.title, code: c.id })));
      });
    }
  }, [isAddFoodVisible, restaurantId]);

  const closeSidebar = () => { setIsAddFoodVisible(false); setFood(null); };

  return (
    <Sidebar visible={isAddFoodVisible} onHide={closeSidebar} position="right" className="w-full sm:w-[450px]">
      <Formik
        initialValues={{ title: food?.title || '', description: food?.description || '', categoryId: food?.categoryId || '' }}
        validationSchema={Yup.object({ title: Yup.string().required('Required') })}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const payload = {
              title: values.title,
              description: values.description,
              category_id: values.categoryId?.code || values.categoryId || null
            };
            if (isEditing) {
              await adminFoodService.updateFood(food._id, payload);
              showToast({ title: t('Success'), type: 'success', message: t('Updated') });
            } else {
              await adminFoodService.createFood({ ...payload, restaurant_id: restaurantId });
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
            <h2 className="mb-3 text-xl font-bold">{isEditing ? t('Edit') : t('Add')} {t('Food')}</h2>
            <CustomTextField value={values.title} name="title" showLabel placeholder={t('Title')} type="text" onChange={(e) => setFieldValue('title', e.target.value)} />
            <CustomTextField value={values.description} name="description" showLabel placeholder={t('Description')} type="text" onChange={(e) => setFieldValue('description', e.target.value)} />
            <div className="mb-2">
                 {/* @ts-ignore */}
                 <DropdownComponent
                    options={categories}
                    selectedOption={values.categoryId}
                    setSelectedOption={(val) => setFieldValue('categoryId', val)}
                    placeholder={t('Select Category')}
                  />
            </div>
            <button className="float-end h-10 rounded-md bg-black px-8 text-white" disabled={loading} type="submit">
              {loading ? <ProgressSpinner className="w-6 h-6" /> : (isEditing ? t('Update') : t('Add'))}
            </button>
          </Form>
        )}
      </Formik>
    </Sidebar>
  );
}
