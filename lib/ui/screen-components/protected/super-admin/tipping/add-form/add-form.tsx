
'use client';

import { useEffect, useState } from 'react';
import { ITippingsForm } from '@/lib/utils/interfaces';
import { TippingSchema } from '@/lib/utils/schema/tipping';
import CustomButton from '@/lib/ui/useable-components/button';
import CustomNumberTextField from '@/lib/ui/useable-components/custom-input';
import { ErrorMessage, Form, Formik, FormikHelpers } from 'formik';
import useToast from '@/lib/hooks/useToast';
import { useTranslations } from 'next-intl';
import { adminConfigService } from '@/lib/supabase/services/adminConfigService';
import { supabase } from '@/lib/supabase/client';

const TippingAddForm = () => {
  const t = useTranslations();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  
  const [initialValues, setInitialValues] = useState<ITippingsForm>({
    tip1: 10,
    tip2: 20,
    tip3: 30,
  });

  useEffect(() => {
    const fetchTippingConfig = async () => {
      try {
        const { data, error } = await supabase.from('configurations').select('id, value').eq('key', 'tipping_variations').limit(1);
        if (!error && data && data.length > 0) {
          setConfigId(data[0].id);
          const val = typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
          setInitialValues({
            tip1: val[0] ?? 10,
            tip2: val[1] ?? 20,
            tip3: val[2] ?? 30,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTippingConfig();
  }, []);

  const handleSubmit = async (values: ITippingsForm, { resetForm }: FormikHelpers<ITippingsForm>) => {
    setSaving(true);
    try {
      const tipVariations = [values.tip1, values.tip2, values.tip3];
      if (configId) {
        await supabase.from('configurations').update({ value: tipVariations }).eq('id', configId);
      } else {
        await supabase.from('configurations').insert([{ key: 'tipping_variations', value: tipVariations }]);
      }
      showToast({ type: 'success', title: t('Success'), message: t('Tipping updated'), duration: 3000 });
    } catch (error) {
      showToast({ type: 'error', title: t('Error'), message: t('ActionFailedTryAgain'), duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3">
      <Formik
        initialValues={initialValues}
        validationSchema={TippingSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form className="grid grid-cols-2 items-center gap-3 sm:grid-cols-4">
            <div className="relative">
              <CustomNumberTextField
                name="tip1" placeholder={t('Tip 1 eg 10')} min={1} max={100} value={values.tip1} onChange={setFieldValue} isLoading={loading} showLabel
                style={{ borderColor: errors?.tip1 && touched.tip1 ? 'red' : '' }}
              />
              <div className="absolute bottom-[-18px] text-xs text-red-500"><ErrorMessage name="tip1" /></div>
            </div>
            <div className="relative">
              <CustomNumberTextField
                name="tip2" placeholder={t('Tip 2 eg 20')} min={1} max={100} isLoading={loading} showLabel value={values.tip2} onChange={setFieldValue}
                style={{ borderColor: errors.tip2 && touched.tip2 ? 'red' : '' }}
              />
              <div className="absolute bottom-[-18px] text-xs text-red-500"><ErrorMessage name="tip2" /></div>
            </div>
            <div className="relative">
              <CustomNumberTextField
                name="tip3" min={1} max={100} placeholder={t('Tip 3 eg 30')} isLoading={loading} showLabel value={values.tip3} onChange={setFieldValue}
                style={{ borderColor: errors.tip3 && touched.tip3 ? 'red' : '' }}
              />
              <div className="absolute bottom-[-18px] text-xs text-red-500"><ErrorMessage name="tip3" /></div>
            </div>
            <CustomButton
              className="mb-[2px] mt-auto flex h-11 rounded-md border border-gray-300 bg-[black] dark:bg-dark-900 dark:border-dark-600 dark:text-white px-10 text-white"
              label={configId ? t('Update') : t('Add')}
              rounded={false} type="submit" loading={saving} disabled={saving || loading}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
};
export default TippingAddForm;
