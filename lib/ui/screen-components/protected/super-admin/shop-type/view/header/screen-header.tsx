import { useTranslations } from 'next-intl';
import HeaderText from '@/lib/ui/useable-components/header-text';
import TextIconClickable from '@/lib/ui/useable-components/text-icon-clickable';
import { faAdd } from '@fortawesome/free-solid-svg-icons';

const ShopTypesHeader = ({ setVisible }: { setVisible: (val: boolean) => void }) => {
  const t = useTranslations();
  return (
    <div className="sticky top-0 z-10 w-full flex-shrink-0 bg-white dark:bg-dark-950 p-3 shadow-sm">
      <div className="flex w-full justify-between">
        <HeaderText text={t('Shop Types')} />
        <TextIconClickable
          className="rounded border dark:border-dark-600 border-gray-300 bg-black text-white sm:w-auto"
          icon={faAdd}
          iconStyles={{ color: 'currentColor' }}
          title={t('Add Shop Type')}
          onClick={() => setVisible(true)}
        />
      </div>
    </div>
  );
};

export default ShopTypesHeader;
