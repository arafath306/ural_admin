'use client';

// Core
import { useCallback, useContext, useEffect, useState } from 'react';

// Prime React
import { FilterMatchMode } from 'primereact/api';

// Interface and Types
import {
  IActionMenuItem,
  IFood,
  IFoodNew,
} from '@/lib/utils/interfaces';

// Components
import Table from '@/lib/ui/useable-components/table';
import FoodsTableHeader from '../header/table-header';
import { FOODS_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/foods-columns';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';

// Context
import { FoodsContext } from '@/lib/context/restaurant/foods.context';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';

// Toast & Localization
import useToast from '@/lib/hooks/useToast';
import { useTranslations } from 'next-intl';

// Supabase
import { adminStoreService } from '@/lib/supabase/services/adminStoreService';
import { supabase } from '@/lib/supabase/client';

function mapToFoodNew(f: IFood): IFoodNew {
  return {
    _id: f._id,
    title: f.title || '',
    description: f.description || '',
    image: f.image || '',
    isActive: Boolean(f.isActive),
    isOutOfStock: Boolean(f.isOutOfStock),
    category: f.subCategory ? { label: f.subCategory, code: f.subCategory } : null,
    subCategory: null,
    variations: f.variations || [],
    __typename: 'Food',
  };
}

export default function FoodsMain() {
  const t = useTranslations();
  const { showToast } = useToast();

  const {
    onFoodFormVisible,
    onSetFoodContextData,
    onActiveStepChange,
  } = useContext(FoodsContext);

  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const restaurantId =
    restaurantLayoutContextData?.restaurantId ||
    '55555555-5555-5555-5555-555555555551';

  const [deleteId, setDeleteId] = useState('');
  const [foods, setFoods] = useState<IFoodNew[]>([]);
  const [rawFoods, setRawFoods] = useState<IFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<IFoodNew[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters] = useState({
    global: { value: '' as string | null, matchMode: FilterMatchMode.CONTAINS },
  });

  const fetchFoods = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await adminStoreService.fetchFoods(restaurantId);
      setRawFoods(res);
      setFoods(res.map(mapToFoodNew));
    } catch (err) {
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel('foods-sync-' + restaurantId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurants',
          filter: `id=eq.${restaurantId}`,
        },
        () => {
          fetchFoods();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, fetchFoods]);

  const handleDelete = async () => {
    if (!deleteId || !restaurantId) return;
    try {
      setMutationLoading(true);
      const updated = rawFoods.filter((f) => f._id !== deleteId);
      await adminStoreService.saveFoods(restaurantId, updated);
      setRawFoods(updated);
      setFoods(updated.map(mapToFoodNew));
      showToast({
        type: 'success',
        title: t('Delete Food'),
        message: `${t('Food has been deleted successfully')}.`,
      });
      setDeleteId('');
    } catch {
      showToast({
        type: 'error',
        title: t('Delete Food'),
        message: t('Food delete failed'),
      });
    } finally {
      setMutationLoading(false);
    }
  };

  const filteredFoods = foods.filter((f) => {
    if (!globalFilterValue) return true;
    return (
      f.title.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(globalFilterValue.toLowerCase()))
    );
  });

  const menuItems: IActionMenuItem<IFoodNew>[] = [
    {
      label: t('Edit'),
      command: (data?: IFoodNew) => {
        if (data) {
          onActiveStepChange(0);
          onSetFoodContextData({
            isEditing: true,
            food: {
              _id: data._id,
              data: data,
              variations: data.variations || [],
            },
          });
          onFoodFormVisible(true);
        }
      },
    },
    {
      label: t('Delete'),
      command: (data?: IFoodNew) => {
        if (data) {
          setDeleteId(data._id);
        }
      },
    },
  ];

  return (
    <div className="p-3">
      <Table
        header={
          <FoodsTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={(e) => setGlobalFilterValue(e.target.value)}
          />
        }
        data={filteredFoods}
        filters={filters}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        columns={FOODS_TABLE_COLUMNS({ menuItems })}
        loading={loading}
      />
      <CustomDialog
        loading={mutationLoading}
        visible={!!deleteId}
        onHide={() => {
          setDeleteId('');
        }}
        onConfirm={handleDelete}
        message={t('Are you sure you want to delete this food item?')}
      />
    </div>
  );
}
