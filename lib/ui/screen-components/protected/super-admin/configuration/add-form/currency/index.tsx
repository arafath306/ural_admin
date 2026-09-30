'use client';
// Core
import { Form, Formik } from 'formik';
import { useState } from 'react';

// Components
import ConfigCard from '../../view/card';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';

// Toast
import useToast from '@/lib/hooks/useToast';

// Hooks
import { useConfiguration } from '@/lib/hooks/useConfiguration';

// Interfaces and Types
import { ICurrencyForm } from '@/lib/utils/interfaces/configurations.interface';
import { IDropdownSelectItem } from '@/lib/utils/interfaces';

// Utils and Constants
import { CurrencyValidationSchema } from '@/lib/utils/schema';
import { currencies, currenciesSymbol } from '@/lib/utils/constants/currency';

// Supabase
import { adminConfigService } from '@/lib/supabase/services/adminConfigService';

// GraphQL



const CurrencyAddForm = () => {
  const { CURRENCY_CODE, CURRENT_SYMBOL } = useConfiguration();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const initialCurrency = CURRENCY_CODE
    ? currencies.find((c) => c.code === CURRENCY_CODE) || { code: 'BDT', label: 'BDT' }
    : { code: 'BDT', label: 'BDT' };

  const initialSymbol = CURRENT_SYMBOL
    ? currenciesSymbol.find((s) => s.code === CURRENT_SYMBOL || s.currency === CURRENCY_CODE) || { code: '৳', label: '৳' }
    : { code: '৳', label: '৳' };

  const initialValues: ICurrencyForm = {
    currency: initialCurrency,
    currencySymbol: initialSymbol as unknown as IDropdownSelectItem,
  };

  const [mutate] = [() => {}];

  const handleSubmit = async (values: ICurrencyForm) => {
    const currency = values?.currency?.code || 'BDT';
    const currencySymbol = values?.currencySymbol?.code || '৳';

    try {
      setIsSaving(true);
      await adminConfigService.updateConfiguration({
        currency,
        currencySymbol,
      });

      try {
        mutate({
          variables: {
            configurationInput: {
              currency,
              currencySymbol,
            },
          },
        });
      } catch (e) {}

      showToast({
        type: 'success',
        title: 'Success!',
        message: 'Currency Configurations Updated Successfully',
        duration: 3000,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error!',
        message: err?.message || 'Failed to update currency',
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
        validationSchema={CurrencyValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleSubmit, setFieldValue }) => {
          return (
            <Form onSubmit={handleSubmit}>
              <ConfigCard
                cardTitle="Currency"
                buttonLoading={isSaving}
              >
                <div className="flex flex-col gap-4">
                  <CustomDropdownComponent
                    name="currency"
                    placeholder="Currency"
                    options={currencies}
                    selectedItem={values.currency}
                    setSelectedItem={(_name: string, val: any) => {
                      setFieldValue('currency', val);
                      const symbolMatch = currenciesSymbol.find((s) => s.currency === val?.code);
                      if (symbolMatch) {
                        setFieldValue('currencySymbol', symbolMatch);
                      }
                    }}
                    showLabel
                  />
                  <CustomDropdownComponent
                    name="currencySymbol"
                    placeholder="Currency Symbol"
                    options={currenciesSymbol}
                    selectedItem={values.currencySymbol}
                    setSelectedItem={setFieldValue}
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

export default CurrencyAddForm;
