'use client';
import { Form, Formik, FormikHelpers } from 'formik';
import dynamic from 'next/dynamic';
import { IZoneAddFormComponentProps } from '@/lib/utils/interfaces';
import CustomButton from '@/lib/ui/useable-components/button';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import { ZoneErrors } from '@/lib/utils/constants';
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';
import { extractLatLngPoints, pointsToGeoJSON } from '@/lib/utils/methods';
import { ZoneSchema } from '@/lib/utils/schema';
import useToast from '@/lib/hooks/useToast';
import { IZoneForm } from '@/lib/utils/interfaces/forms/zone.form.interface';
import CustomTextAreaField from '@/lib/ui/useable-components/custom-text-area-field';
import { TPolygonPoints } from '@/lib/utils/types';
import { adminZoneService } from '@/lib/supabase/services/adminZoneService';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';

// Load map without SSR
const ZoneMapPicker = dynamic(
  () => import('@/lib/ui/useable-components/google-maps/location-bounds-zone/map'),
  { ssr: false, loading: () => <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-lg"><div className="text-center text-gray-500"><div className="text-3xl mb-2">🗺️</div><p>Loading Map...</p></div></div> }
);

const DESCRIPTION_MAX_LENGTH = 100;

interface IZoneAddFormFullProps {
  onHide: () => void;
  zone: IZoneAddFormComponentProps['zone'];
  isAddZoneVisible?: boolean;
}

export default function ZoneAddForm({ onHide, zone }: IZoneAddFormFullProps) {
  const initialValues: IZoneForm = {
    _id: zone?._id ?? '',
    title: zone?.title || '',
    description: zone?.description || '',
    coordinates: zone?.location?.coordinates ?? [],
  };

  const t = useTranslations();
  const { showToast } = useToast();
  const [mutationLoading, setMutationLoading] = useState(false);

  const handleSubmit = async (
    values: IZoneForm,
    { resetForm }: FormikHelpers<IZoneForm>
  ) => {
    try {
      setMutationLoading(true);
      const points = extractLatLngPoints(values.coordinates);
      if (points.length < 3) {
        showToast({
          type: 'error',
          title: 'সীমানা প্রয়োজন',
          message: 'অনুগ্রহ করে ম্যাপের পলিগন টুল (⬡) ব্যবহার করে আপনার জোনের সীমানা ড্র করুন।',
        });
        setMutationLoading(false);
        return;
      }

      const input = {
        title: values.title,
        description: values.description,
        coordinates: pointsToGeoJSON(points),
      };

      if (zone?._id) {
        await adminZoneService.updateZone(zone._id, input);
      } else {
        await adminZoneService.createZone(input);
      }

      showToast({
        type: 'success',
        title: zone ? 'Zone Updated' : 'Zone Added',
        message: zone ? 'Zone has been updated successfully' : 'Zone has been added successfully',
      });
      resetForm();
      onHide();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: zone ? 'Edit Zone Error' : 'Add Zone Error',
        message: err?.message || 'Something went wrong, Please try again',
      });
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden gap-4 h-full">
      <Formik
        initialValues={initialValues}
        validationSchema={ZoneSchema}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnChange={false}
      >
        {({ values, errors, handleChange, handleSubmit, setFieldValue }) => {
          const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
            const { value } = event.target;
            if (value.length > DESCRIPTION_MAX_LENGTH) {
              showToast({ type: 'error', title: 'Description', message: 'Character limit of max length 100' });
              setFieldValue('description', value.slice(0, DESCRIPTION_MAX_LENGTH));
              return;
            }
            handleChange(event);
          };

          const activePoints = extractLatLngPoints(values.coordinates);

          return (
            <Form onSubmit={handleSubmit} className="flex flex-1 gap-4 overflow-hidden w-full">
              {/* LEFT: Form */}
              <div className="w-[360px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto bg-white dark:bg-dark-950 rounded-xl border border-gray-200 dark:border-dark-600 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold dark:text-white">
                    {zone ? '✏️ Edit Zone' : '➕ Add Zone'}
                  </h2>
                  <button
                    type="button"
                    onClick={onHide}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div>
                  <CustomTextField
                    type="text"
                    name="title"
                    placeholder={t('Title')}
                    maxLength={35}
                    value={values.title}
                    onChange={handleChange}
                    showLabel={true}
                    style={{ borderColor: onErrorMessageMatcher('title', errors?.title, ZoneErrors) ? 'red' : '' }}
                  />
                </div>

                <div>
                  <CustomTextAreaField
                    name="description"
                    placeholder={t('Description')}
                    value={values.description}
                    onChange={handleDescriptionChange}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    showLabel={true}
                    style={{ borderColor: onErrorMessageMatcher('description', errors?.description, ZoneErrors) ? 'red' : '' }}
                  />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1.5 flex items-center gap-1.5">
                    <span>🗺️</span> জোন সীমানা ড্র করার নিয়ম:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>ম্যাপের বাম টুলবার থেকে <strong>পলিগন (⬡)</strong> টুলে ক্লিক করুন</li>
                    <li>ম্যাপের যে এলাকাটি অন্তর্ভুক্ত করতে চান সেখানে পয়েন্টে পয়েন্টে ক্লিক করুন</li>
                    <li>ড্র শেষ হলে প্রথম পয়েন্টের উপর ক্লিক করুন</li>
                    <li>পয়েন্টগুলো স্বয়ংক্রিয়ভাবে সেভ হবে, এরপর <strong>{zone ? 'Update' : 'Add'}</strong> বাটনে ক্লিক করুন</li>
                  </ol>
                </div>

                {activePoints.length >= 3 ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300 font-medium">
                    ✅ সীমানা সক্রিয় ({activePoints.length} points selected)
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                    ⚠️ এখনও কোনো সীমানা ড্র করা হয়নি। ম্যাপে আপনার কাঙ্ক্ষিত এলাকা ড্র করুন।
                  </div>
                )}

                <div className="mt-auto flex gap-2">
                  <button
                    type="button"
                    onClick={onHide}
                    className="flex-1 h-10 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition"
                  >
                    Cancel
                  </button>
                  <CustomButton
                    className="flex-1 h-10 bg-black text-white rounded-lg px-6 hover:bg-gray-800 transition"
                    label={zone ? t('Update') : t('Add')}
                    type="submit"
                    loading={mutationLoading}
                  />
                </div>
              </div>

              {/* RIGHT: Map */}
              <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-dark-600 shadow-sm bg-white">
                <ZoneMapPicker
                  _id={values._id ?? ''}
                  _path={values.coordinates}
                  onSetZoneCoordinates={(path: TPolygonPoints) => setFieldValue('coordinates', path)}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}