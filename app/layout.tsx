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
