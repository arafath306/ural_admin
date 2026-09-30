'use client';

// Core
import React, { useCallback, useEffect, useState } from 'react';

// Interfaces
import {
  IConfiguration,
  IConfigurationProviderProps,
  ILazyQueryResult,
} from '@/lib/utils/interfaces';

// API


// Hooks

// Supabase Configuration Service
import {
  adminConfigService,
  DEFAULT_CONFIG,
} from '@/lib/supabase/services/adminConfigService';

export const ConfigurationContext = React.createContext<
  IConfiguration | undefined
>({
  _id: '',
  pushToken: '',
  webClientID: '',
  publishableKey: '',
  clientId: '',
  googleApiKey: '',
  webAmplitudeApiKey: '',
  appAmplitudeApiKey: '',
  googleColor: '',
  webSentryUrl: '',
  apiSentryUrl: '',
  customerAppSentryUrl: '',
  restaurantAppSentryUrl: '',
  riderAppSentryUrl: '',
  skipEmailVerification: false,
  skipMobileVerification: false,
  skipWhatsAppOTP: false,
  currency: 'BDT',
  currencySymbol: '৳',
  deliveryRate: 50,
  googleMapLibraries: '',
  twilioEnabled: false,
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioPhoneNumber: '',
  twilioWhatsAppNumber: '',
  firebaseKey: '',
  appId: '',
  authDomain: '',
  storageBucket: '',
  msgSenderId: '',
  measurementId: '',
  projectId: '',
  dashboardSentryUrl: '',
  cloudinaryUploadUrl: '',
  cloudinaryApiKey: '',
  vapidKey: '',
  isPaidVersion: false,
  email: 'admin@ural.com',
  emailName: 'Ural Delivery',
  password: '',
  enableEmail: true,
  clientSecret: '',
  sandbox: false,
  secretKey: '',
  formEmail: '',
  sendGridApiKey: '',
  sendGridEnabled: false,
  sendGridEmail: '',
  sendGridEmailName: '',
  sendGridPassword: '',
  androidClientID: '',
  iOSClientID: '',
  expoClientID: '',
  termsAndConditions: '',
  privacyPolicy: '',
  testOtp: '',
  costType: 'fixed',
  enableCustomerDemoMode: false,
  customerDemoZoneId: '',
  enableRiderDemo: false,
  enableRestaurantDemo: false,
  enableAdminDemo: false,
});

export const ConfigurationProvider: React.FC<IConfigurationProviderProps> = ({
  children,
}) => {
  const [configuration, setConfiguration] = useState<
    IConfiguration | undefined
  >();



  // Load from Supabase service
  const loadSupabaseConfig = useCallback(async () => {
    try {
      const cfg = await adminConfigService.fetchConfiguration();
      setConfiguration((prev) => ({
        _id: 'default',
        pushToken: '',
        webClientID: '',
        publishableKey: '',
        clientId: '',
        googleApiKey: '',
        webAmplitudeApiKey: '',
        appAmplitudeApiKey: '',
        googleColor: '',
        webSentryUrl: '',
        apiSentryUrl: '',
        customerAppSentryUrl: '',
        restaurantAppSentryUrl: '',
        riderAppSentryUrl: '',
        skipEmailVerification: cfg.skipEmailVerification ?? false,
        skipMobileVerification: cfg.skipMobileVerification ?? false,
        skipWhatsAppOTP: false,
        currency: cfg.currency || 'BDT',
        currencySymbol: cfg.currencySymbol || '৳',
        deliveryRate: cfg.deliveryRate ?? 50,
        googleMapLibraries: '',
        twilioEnabled: cfg.twilioEnabled ?? false,
        twilioAccountSid: cfg.twilioAccountSid || '',
        twilioAuthToken: cfg.twilioAuthToken || '',
        twilioPhoneNumber: cfg.twilioPhoneNumber || '',
        twilioWhatsAppNumber: '',
        firebaseKey: '',
        appId: '',
        authDomain: '',
        storageBucket: '',
        msgSenderId: '',
        measurementId: '',
        projectId: '',
        dashboardSentryUrl: '',
        cloudinaryUploadUrl: '',
        cloudinaryApiKey: '',
        vapidKey: '',
        isPaidVersion: false,
        email: cfg.email || 'admin@ural.com',
        emailName: cfg.emailName || 'Ural Delivery',
        password: '',
        enableEmail: cfg.enableEmail ?? true,
        clientSecret: '',
        sandbox: false,
        secretKey: '',
        formEmail: '',
        sendGridApiKey: '',
        sendGridEnabled: false,
        sendGridEmail: '',
        sendGridEmailName: '',
        sendGridPassword: '',
        androidClientID: '',
        iOSClientID: '',
        expoClientID: '',
        termsAndConditions: '',
        privacyPolicy: '',
        testOtp: '',
        costType: cfg.costType || 'fixed',
        enableCustomerDemoMode: false,
        customerDemoZoneId: '',
        enableRiderDemo: false,
        enableRestaurantDemo: false,
        enableAdminDemo: false,
        ...(prev || {}),
        ...cfg,
      } as IConfiguration));
    } catch (e) {
      console.warn('Error loading Supabase configuration in context:', e);
    }
  }, []);

  // Listen for local updates
  useEffect(() => {
    loadSupabaseConfig();

    const handleUpdate = () => {
      loadSupabaseConfig();
    };

    window.addEventListener('ural-config-updated', handleUpdate);
    return () => {
      window.removeEventListener('ural-config-updated', handleUpdate);
    };
  }, [loadSupabaseConfig]);



  return (
    <ConfigurationContext.Provider value={configuration}>
      {children}
    </ConfigurationContext.Provider>
  );
};
