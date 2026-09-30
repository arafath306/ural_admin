'use client';

// Core imports
import { useContext, useEffect, useRef, useState } from 'react';

// Context
import { RestaurantsContext } from '@/lib/context/super-admin/restaurants.context';

// Interfaces
import {
  IRestaurantsAddFormComponentProps,
  IRestaurantsContextPropData,
} from '@/lib/utils/interfaces';

// PrimeReact components
import { Sidebar } from 'primereact/sidebar';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';

// Local components
import RestaurantDetailsForm from './restaurant-details';
import RestaurantLocation from './restaurant-location';
import VendorDetails from './vendor-details';
import RestaurantTiming from './restaurant-timing';
import { useTranslations } from 'next-intl';

// Supabase
import { adminStoreService } from '@/lib/supabase/services/adminStoreService';

const RestaurantsForm = ({
  position = 'right',
}: IRestaurantsAddFormComponentProps) => {
  // Hooks
  const t = useTranslations();

  // Ref
  const stepperRef = useRef(null);

  // Context
  const {
    isRestaurantsFormVisible,
    onRestaurantsFormVisible,
    activeIndex,
    onActiveStepChange,
    onSetRestaurantsContextData,
  } = useContext(RestaurantsContext);

  const [vendorsDropdown, setVendorsDropdown] = useState<{ label: string; code: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    adminStoreService.fetchVendors().then((vendors) => {
      if (isMounted) {
        setVendorsDropdown(vendors.map((v) => ({ label: v.email, code: v._id })));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers
  const onHandleStepChange = (order: number) => {
    onActiveStepChange(order);
  };
  const onSidebarHideHandler = () => {
    onActiveStepChange(0);
    onRestaurantsFormVisible(false);
    onSetRestaurantsContextData({} as IRestaurantsContextPropData);
  };

  return (
    <Sidebar
      visible={isRestaurantsFormVisible}
      position={position}
      onHide={onSidebarHideHandler}
      className="w-full sm:w-[600px] dark:text-white dark:bg-dark-950 border dark:border-dark-600"
    >
      <div ref={stepperRef}>
        <Stepper linear headerPosition="bottom" activeStep={activeIndex}>
          <StepperPanel header={t('Set Vendor')}>
            <VendorDetails
              vendorsDropdown={vendorsDropdown}
              stepperProps={{
                onStepChange: onHandleStepChange,
                order: activeIndex,
              }}
            />
          </StepperPanel>
          <StepperPanel header={t('Add Details')}>
            <RestaurantDetailsForm
              stepperProps={{
                onStepChange: onHandleStepChange,
                order: activeIndex,
              }}
            />
          </StepperPanel>
          <StepperPanel header={t('Location')}>
            <RestaurantLocation
              stepperProps={{
                onStepChange: onHandleStepChange,
                order: activeIndex,
                isLastStep: true,
              }}
            />
          </StepperPanel>
          <StepperPanel header={t('Timing')}>
            <RestaurantTiming
              stepperProps={{
                onStepChange: onHandleStepChange,
                order: activeIndex,
                isLastStep: true,
              }}
            />
          </StepperPanel>
        </Stepper>
      </div>
    </Sidebar>
  );
};

export default RestaurantsForm;
