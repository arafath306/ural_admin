
'use client';
import { ToastContext } from '@/lib/context/global/toast.context';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import { BannerFormSchema } from '@/lib/utils/schema/banner';
import { Form, Formik } from 'formik';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Sidebar } from 'primereact/sidebar';
import { useContext, useState } from 'react';
import { onErrorMessageMatcher } from '@/lib/utils/methods';
import { BannerErrors } from '@/lib/utils/constants';
import { useTranslations } from 'next-intl';
import { adminBannerService } from '@/lib/supabase/services/adminBannerService';

export default function BannerForm({ setIsAddBannerVisible, setBanner, isEditing, visible, setIsEditing }: { setIsAddBannerVisible?: any, setBanner?: any, setVisible?: any, isEditing: any, visible: boolean, setIsEditing: any }) {
  const closeSidebar = () => {
    if (setIsAddBannerVisible) setIsAddBannerVisible(false);
    setIsEditing({ bool: false, data: {} });
  };

  const { showToast } = useContext(ToastContext);
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    _id: isEditing.bool ? isEditing?.data?._id : '',
    title: isEditing.bool ? isEditing?.data?.title : '',
    description: isEditing.bool ? isEditing?.data?.description : '',
    action: isEditing.bool ? isEditing?.data?.action : '',
    file: isEditing.bool ? isEditing?.data?.file : '',
  };

  // Replaced above

  return (
    <Sidebar visible={visible} onHide={closeSidebar} position="right" className="w-full sm:w-[450px] dark:text-white dark:bg-dark-950 border dark:border-dark-600">
      <Formik
        initialValues={initialValues}
        validationSchema={BannerFormSchema}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const payload = {
              title: values.title,
              description: values.description,
              action: values.action,
              file: values.file || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
            };
            if (isEditing.bool && values._id) {
              await adminBannerService.updateBanner(values._id, payload);
              showToast({ title: t('Success'), type: 'success', message: t('Banner updated') });
            } else {
              await adminBannerService.createBanner(payload);
              showToast({ title: t('Success'), type: 'success', message: t('Banner created') });
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
              <h2 className="mb-3 text-xl font-bold">{isEditing.bool ? t('Edit') : t('Add')} {t('Banner')}</h2>
              <CustomTextField
                value={values.title}
                name="title"
                showLabel={true}
                placeholder={t('Title')}
                type="text"
                onChange={(e) => setFieldValue('title', e.target.value)}
                style={{ borderColor: onErrorMessageMatcher('title', errors?.title, BannerErrors) ? 'red' : '' }}
              />
              <CustomTextField
                value={values.description}
                name="description"
                showLabel={true}
                placeholder={t('Description')}
                type="text"
                onChange={(e) => setFieldValue('description', e.target.value)}
              />
              <CustomTextField
                value={values.action}
                name="action"
                showLabel={true}
                placeholder={t('Action')}
                type="text"
                onChange={(e) => setFieldValue('action', e.target.value)}
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
