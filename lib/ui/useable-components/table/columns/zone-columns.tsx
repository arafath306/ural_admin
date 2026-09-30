import { IActionMenuProps, IZoneResponse } from '@/lib/utils/interfaces';
import ActionMenu from '../../action-menu';
import { useTranslations } from 'next-intl';
import { extractLatLngPoints } from '@/lib/utils/methods';

export const ZONE_TABLE_COLUMNS = ({
  menuItems,
}: {
  menuItems: IActionMenuProps<IZoneResponse>['items'];
}) => {
  const t = useTranslations();
  return [
    { headerName: t('Title'), propertyName: 'title' },
    { headerName: t('Description'), propertyName: 'description' },
    {
      headerName: 'Zone Boundary',
      propertyName: 'location',
      body: (zone: IZoneResponse) => {
        const points = extractLatLngPoints(zone?.location?.coordinates || zone?.location);
        if (points.length >= 3) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              {points.length} points active
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-gray-400">
            No boundary
          </span>
        );
      },
    },
    {
      propertyName: 'actions',
      body: (zone: IZoneResponse) => (
        <ActionMenu items={menuItems} data={zone} />
      ),
    },
  ];
};