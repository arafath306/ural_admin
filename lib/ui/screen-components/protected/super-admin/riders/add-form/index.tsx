'use client';

// Formik
import { Form, Formik, FormikHelpers } from 'formik';

// Prime React
import { Sidebar } from 'primereact/sidebar';

// Interface and Types
import { IRiderForm } from '@/lib/utils/interfaces/forms';
import { IRidersAddFormComponentProps } from '@/lib/utils/interfaces';

// Components
import CustomButton from '@/lib/ui/useable-components/button';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';
import CustomPhoneTextField from '@/lib/ui/useable-components/phone-input-field';

// Utilities and Constants
import { VEHICLE_TYPE } from '@/lib/utils/constants';
import { RiderSchema, EditRiderSchema } from '@/lib/utils/schema/rider';

// Toast & Localization
import useToast from '@/lib/hooks/useToast';
import { useTranslations } from 'next-intl';

// Supabase
import { adminRiderService, IZoneItem } from '@/lib/supabase/services/adminRiderService';
import { useEffect, useState } from 'react';

export default function RiderAddForm({
  onHide,
  rider,
  position = 'right',
  isAddRiderVisible,
}: IRidersAddFormComponentProps) {
  const initialValues: IRiderForm = {
    name: rider?.name || '',
    username: rider?.username || '',
    password: '',
    confirmPassword: '',
    phone: rider?.phone ? rider.phone.toString() : '',
    vehicleType: rider
      ? VEHICLE_TYPE.find((vt) => vt?.code === rider?.vehicleType) || null
      : null,
    zone: rider?.zone
      ? { label: rider.zone.title, code: rider.zone._id }
      : null,
  };

  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // Zones state
  const [zones, setZones] = useState<IZoneItem[]>([]);
  const [mutationLoading, setMutationLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    adminRiderService.fetchZones().then((res) => {
      if (isMounted) setZones(res);
    });
    return () => {
      isMounted = false;
    };
  }, [isAddRiderVisible]);

  // Form Submission
  const handleSubmit = async (
    values: IRiderForm,
    { resetForm }: FormikHelpers<IRiderForm>
  ) => {
    try {
      setMutationLoading(true);
      if (rider) {
        await adminRiderService.updateRider(rider._id, {
          name: values.name,
          username: values.username,
          phone: values.phone?.toString(),
          zone: values.zone?.code || values.zone?.label,
          vehicleType: values.vehicleType?.code,
          available: rider.available,
          ...(values.password ? { password: values.password } : {}),
        });
        showToast({
          type: 'success',
          title: t('Success'),
          message: t('Rider updated'),
          duration: 3000,
        });
      } else {
        await adminRiderService.createRider({
          name: values.name,
          username: values.username,
          phone: values.phone?.toString(),
          zone: values.zone?.code || values.zone?.label,
          vehicleType: values.vehicleType?.code,
          available: true,
          password: values.password || '123456',
        });
        showToast({
          type: 'success',
          title: t('Success'),
          message: t('Rider added'),
          duration: 3000,
        });
      }
      resetForm();
      onHide();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('Error'),
        message: error?.message || t('ActionFailedTryAgain'),
        duration: 3000,
      });
    } finally {
      setMutationLoading(false);
    }
  };

  return (
    <Sidebar
      visible={isAddRiderVisible}
      position={position}
      onHide={onHide}
      className="w-full sm:w-[480px] dark:text-white dark:bg-dark-950 border dark:border-dark-600"
    >
      <div className="flex h-full w-full items-center justify-start">
        <div className="h-full w-full">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex flex-col">
              <span className="text-xl font-bold dark:text-white">
                {rider ? t('Edit') : t('Add')} {t('Rider')}
              </span>
              <span className="text-xs text-gray-500">
                {rider ? 'Update rider profile details' : 'Create a new rider account for delivery'}
              </span>
            </div>

            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={rider ? EditRiderSchema : RiderSchema}
                onSubmit={handleSubmit}
                enableReinitialize
                validateOnChange={true}
                validateOnBlur={true}
              >
                {({
                  values,
                  errors,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  setFieldTouched,
                  setTouched,
                  touched,
                }) => {
                  return (
                    <Form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        {/* Name */}
                        <div>
                          <CustomTextField
                            type="text"
                            name="name"
                            placeholder={t('Name')}
                            maxLength={35}
                            value={values.name}
                            onChange={handleChange}
                            showLabel={true}
                            style={{
                              borderColor: errors?.name && touched?.name ? 'red' : '',
                            }}
                          />
                          {errors?.name && touched?.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                          )}
                        </div>

                        {/* Username */}
                        <div>
                          <CustomTextField
                            type="text"
                            name="username"
                            placeholder={t('Username')}
                            maxLength={35}
                            value={values.username}
                            onChange={handleChange}
                            showLabel={true}
                            style={{
                              borderColor: errors?.username && touched?.username ? 'red' : '',
                            }}
                          />
                          {errors?.username && touched?.username && (
                            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                          )}
                        </div>

                        {/* Password */}
                        <div>
                          <CustomPasswordTextField
                            placeholder={rider ? 'New Password (Optional)' : t('Password')}
                            name="password"
                            maxLength={20}
                            value={values.password}
                            showLabel={true}
                            onChange={handleChange}
                            feedback={false}
                            style={{
                              borderColor: errors?.password && touched?.password ? 'red' : '',
                            }}
                          />
                          {errors?.password && touched?.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <CustomPasswordTextField
                            placeholder={t('Confirm Password')}
                            name="confirmPassword"
                            maxLength={20}
                            showLabel={true}
                            value={values.confirmPassword ?? ''}
                            onChange={handleChange}
                            feedback={false}
                            style={{
                              borderColor: errors?.confirmPassword && touched?.confirmPassword ? 'red' : '',
                            }}
                          />
                          {errors?.confirmPassword && touched?.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                          )}
                        </div>

                        {/* Vehicle Type */}
                        <div>
                          <CustomDropdownComponent
                            placeholder={t('Vehicle Type')}
                            options={VEHICLE_TYPE}
                            showLabel={true}
                            name="vehicleType"
                            selectedItem={values.vehicleType}
                            setSelectedItem={setFieldValue}
                            style={{
                              borderColor: errors?.vehicleType && touched?.vehicleType ? 'red' : '',
                            }}
                          />
                          {errors?.vehicleType && touched?.vehicleType && (
                            <p className="text-red-500 text-xs mt-1">
                              {typeof errors.vehicleType === 'string' ? errors.vehicleType : 'Please select a vehicle type'}
                            </p>
                          )}
                        </div>

                        {/* Zone */}
                        <div>
                          <CustomDropdownComponent
                            placeholder={t('Zone')}
                            options={
                              zones.map((val) => ({
                                label: val.title,
                                code: val._id,
                              }))
                            }
                            showLabel={true}
                            name="zone"
                            selectedItem={values.zone}
                            setSelectedItem={setFieldValue}
                            style={{
                              borderColor: errors?.zone && touched?.zone ? 'red' : '',
                            }}
                          />
                          {errors?.zone && touched?.zone && (
                            <p className="text-red-500 text-xs mt-1">
                              {typeof errors.zone === 'string' ? errors.zone : 'Please select a zone'}
                            </p>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div>
                          <CustomPhoneTextField
                            type="text"
                            placeholder={t('Phone Number')}
                            name="phone"
                            showLabel={true}
                            value={values?.phone?.toString()}
                            onChange={(code: string) => {
                              setFieldValue('phone', code);
                              setFieldTouched('phone', true, true);
                            }}
                            style={{
                              borderColor: errors?.phone && touched?.phone ? 'red' : '',
                            }}
                          />
                          {errors?.phone && touched?.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={onHide}
                            className="h-10 px-5 border border-gray-300 dark:border-dark-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition"
                          >
                            Cancel
                          </button>
                          <CustomButton
                            className="h-10 w-fit border-gray-300 border dark:border-dark-600 bg-black px-8 text-white hover:bg-gray-800 transition"
                            label={rider ? t('Update') : t('Add')}
                            type="submit"
                            loading={mutationLoading}
                            onClick={() => {
                              const errKeys = Object.keys(errors);
                              if (errKeys.length > 0) {
                                setTouched({
                                  name: true,
                                  username: true,
                                  password: true,
                                  confirmPassword: true,
                                  vehicleType: true,
                                  zone: true,
                                  phone: true,
                                });
                                showToast({
                                  type: 'error',
                                  title: 'Required Information',
                                  message: 'Please fill in all required fields marked in red.',
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}