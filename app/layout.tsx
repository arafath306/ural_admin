import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';

// ✅ Add metadata export for favicon
export const metadata = {
  title: 'Enatega Admin Dashboard',
  icons: {
    icon: '/favsicons.png',
    // You can add more like:
    // shortcut: "/favicon.png",
    // apple: "/apple-touch-icon.png"
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        {/* Google Maps Mock using OpenStreetMap Nominatim */}
        <Script id="google-maps-mock" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined' && !window.google) {
              window.google = {
                maps: {
                  places: {
                    AutocompleteService: class {
                      getPlacePredictions(request, callback) {
                        fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(request.input))
                          .then(r => r.json())
                          .then(data => {
                            callback(data.map(item => ({
                              place_id: item.place_id,
                              description: item.display_name,
                              structured_formatting: {
                                main_text: item.display_name.split(',')[0],
                                secondary_text: item.display_name.split(',').slice(1).join(','),
                                main_text_matched_substrings: [{ offset: 0, length: request.input.length }]
                              }
                            })));
                          }).catch(() => callback([]));
                      }
                    }
                  },
                  Geocoder: class {
                    geocode(request, callback) {
                      const id = request.placeId || request.place_id;
                      if (id) {
                        fetch('https://nominatim.openstreetmap.org/details?place_id=' + id + '&format=json')
                          .then(r => r.json())
                          .then(data => {
                            if (data && data.centroid) {
                              callback([{
                                geometry: {
                                  location: {
                                    lat: () => parseFloat(data.centroid.coordinates[1]),
                                    lng: () => parseFloat(data.centroid.coordinates[0]),
                                  }
                                }
                              }]);
                            } else {
                              callback([]);
                            }
                          }).catch(() => callback([]));
                      } else {
                        callback([]);
                      }
                    }
                  },
                  LatLngBounds: class { extend() {} },
                  MapMouseEvent: {}
                }
              };
            }
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "tjqxrz689j");
          `}
        </Script>
      
        {/* Global GraphQL Shim for legacy components */}
        <Script id="graphql-global-shim" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              var dummyDoc = { kind: 'Document', definitions: [{ kind: 'OperationDefinition', operation: 'query', name: { kind: 'Name', value: 'DummyQuery' }, selectionSet: { kind: 'SelectionSet', selections: [{ kind: 'Field', name: { kind: 'Name', value: '__typename' } }] } }] };
              var dummyHook = function() { return { data: undefined, loading: false, error: undefined, refetch: function() { return Promise.resolve({ data: undefined }); } }; };
              var dummyMut = function() { return [function() { return Promise.resolve({ data: {} }); }, { loading: false, error: undefined, data: undefined, reset: function() {} }]; };
              var names = ["CREATE_FOOD","CREATE_RESTAURANT","CREATE_RESTAURANT_COUPON","CREATE_STAFF","CREATE_SUB_CATEGORIES","CREATE_TICKET_MESSAGE","CREATE_VENDOR","CREATE_WITHDRAW_REQUEST","CREATE_ZONE","DELETE_RESTAURANT_COUPON","DELETE_STAFF","DELETE_USER","DELETE_ZONE","DUPLICATE_RESTAURANT","EDIT_FOOD","EDIT_RESTAURANT","EDIT_RESTAURANT_COUPON","EDIT_STAFF","EDIT_VENDOR","EDIT_ZONE","GET_ALL_WITHDRAW_REQUESTS","GET_AUDIT_LOGS","GET_CATEGORY_BY_RESTAURANT_ID","GET_CLONED_RESTAURANTS","GET_CONFIGURATION","GET_CUISINES","GET_DASHBOARD_SALES_BY_TYPE","GET_DASHBOARD_USERS_BY_YEAR","GET_FOODS_BY_RESTAURANT_ID","GET_ORDERS_BY_USER","GET_RESTAURANTS","GET_RESTAURANTS_BY_OWNER","GET_RESTAURANT_DASHBOARD_ORDER_SALES_DETAILS_BY_PAYMENT_METHOD","GET_RESTAURANT_DELIVERY_ZONE_INFO","GET_RESTAURANT_PROFILE","GET_SUBCATEGORIES","GET_SUBCATEGORIES_BY_PARENT_ID","GET_TICKET_USERS_WITH_LATEST","GET_USERS_PAGINATED","GET_USER_BY_ID","GET_USER_SUPPORT_TICKETS","GET_VENDORS","GET_VENDOR_BY_ID","GET_VERSIONS","GET_WEB_NOTIFICATIONS","GET_ZONES","MARK_WEB_NOTIFICATIONS_AS_READ","RESET_USER_SESSION","RIDER_UPDATED_SUBSCRIPTION","SAVE_AMPLITUDE_API_KEY_CONFIGURATION","SAVE_APP_CONFIGURATION","SAVE_CLOUDINARY_CONFIGURATION","SAVE_EMAIL_CONFIGURATION","SAVE_FIREBASE_CONFIGURATION","SAVE_GOOGLE_API_KEY_CONFIGURATION","SAVE_GOOGLE_CLIENT_ID_CONFIGURATION","SAVE_PAYPAL_CONFIGURATION","SAVE_SENTRY_CONFIGURATION","SAVE_STRIPE_CONFIGURATION","SAVE_TWILIO_CONFIGURATION","SAVE_VERIFICATION_CONFIGURATION","SEND_NOTIFICATION_USER","SET_VERSIONS","UPDATE_DELIVERY_BOUNDS_AND_LOCATION","UPDATE_DELIVERY_OPTIONS","UPDATE_RESTAURANT_BUSSINESS_DETAILS","UPDATE_RESTAURANT_DELIVERY","UPDATE_TICKET_STATUS","UPDATE_TIMINGS","UPDATE_USER_NOTES","UPDATE_USER_STATUS","UPDATE_WITHDRAW_REQUEST","UPLOAD_TOKEN"];
              names.forEach(function(n) { if (!(n in window)) window[n] = dummyDoc; });
              if (!('useQuery' in window)) window.useQuery = dummyHook;
              if (!('useMutation' in window)) window.useMutation = dummyMut;
              if (!('useQueryGQL' in window)) window.useQueryGQL = dummyHook;
              if (!('useSubscription' in window)) window.useSubscription = dummyHook;
            }
          `}
        </Script>

      </head>
      <body>
        <ThemeProvider attribute={'class'}>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
