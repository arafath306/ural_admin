'use client';
// Core
import { Form, Formik } from 'formik';
import { useState } from 'react';

// Components
import ConfigCard from '../../view/card';
import CustomNumberField from '@/lib/ui/useable-components/number-input-field';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';

// Toast
import useToast from '@/lib/hooks/useToast';

// Hooks
import { useConfiguration } from '@/lib/hooks/useConfiguration';

// Interfaces and Types
import { IDeliveryRateForm } from '@/lib/utils/interfaces/configurations.interface';

// Utils and Constants
import { DeliverytRateValidationSchema } from '@/lib/utils/schema';

// Supabase
import { adminConfigService } from '@/lib/supabase/services/adminConfigService';

// GraphQL



const COST_TYPES = [
  { label: 'Fixed Rate', code: 'fixed' },
  { label: 'Per Kilometer (KM)', code: 'perKM' },
];

const DeliveryRateAddForm = () => {
  const { DELIVERY_RATE, COST_TYPE } = useConfiguration();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const initialValues: IDeliveryRateForm = {
    deliveryRate: DELIVERY_RATE ?? 50,
    costType: COST_TYPE || 'fixed',
  };

  const [mutate] = [() => {}];

  const handleSubmit = async (values: IDeliveryRateForm) => {
    const rate = Number(values.deliveryRate ?? 50);
    const type = values.costType || 'fixed';

    try {
      setIsSaving(true);
      await adminConfigService.updateConfiguration({
        deliveryRate: rate,
        costType: type,
      });

      try {
        mutate({
          variables: {
            configurationInput: {
              deliveryRate: rate,
              costType: type,
            },
          },
        });
      } catch (e) {}

      showToast({
        type: 'success',
        title: 'Success!',
        message: 'Delivery Rate Configurations Updated Successfully',
        duration: 3000,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error!',
        message: err?.message || 'Failed to update delivery rate',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={DeliverytRateValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleSubmit, setFieldValue }) => {
          return (
            <Form onSubmit={handleSubmit}>
              <ConfigCard
                cardTitle="Delivery Rate Configuration"
                buttonLoading={isSaving}
              >
                <div className="flex flex-col gap-4">
                  <CustomNumberField
                    name="deliveryRate"
                    placeholder="Delivery Rate"
                    value={values.deliveryRate ?? 50}
                    onChange={setFieldValue}
                    showLabel
                    min={0}
                  />
                  <CustomDropdownComponent
                    name="costType"
                    placeholder="Cost Calculation Type"
                    options={COST_TYPES}
                    selectedItem={COST_TYPES.find((c) => c.code === values.costType) || COST_TYPES[0]}
                    setSelectedItem={(_name: string, val: any) => setFieldValue('costType', val?.code || 'fixed')}
                    showLabel
                  />
                </div>
              </ConfigCard>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default DeliveryRateAddForm;
