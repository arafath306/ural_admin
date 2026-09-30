'use client';

// Core
import { useCallback, useContext, useEffect, useState } from 'react';

// Components
import Table from '@/lib/ui/useable-components/table';
import { CATEGORY_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/category-columns';
import CategoryTableHeader from '../header/table-header';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import SubCategoriesPreiwModal from '../modal';

// Utilities and Interfaces
import { IActionMenuItem } from '@/lib/utils/interfaces/action-menu.interface';
import { ICategory, ICategoryMainComponentsProps } from '@/lib/utils/interfaces';

// Context
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';

// Toast & Localization
import useToast from '@/lib/hooks/useToast';
import useDebounce from '@/lib/hooks/useDebounce';
import { useTranslations } from 'next-intl';

// Supabase
import { adminStoreService } from '@/lib/supabase/services/adminStoreService';
import { supabase } from '@/lib/supabase/client';

export default function CategoryMain({
  setIsAddCategoryVisible,
  setSubCategories,
  setCategory,
  setIsAddSubCategoriesVisible,
}: ICategoryMainComponentsProps) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // Context
  const {
    restaurantLayoutContextData,
    subCategoryParentId,
    isSubCategoryModalOpen,
    setIsSubCategoryModalOpen,
    setSubCategoryParentId,
  } = useContext(RestaurantLayoutContext);

  const restaurantId =
    restaurantLayoutContextData?.restaurantId ||
    '55555555-5555-5555-5555-555555555551';
  const shopType = restaurantLayoutContextData?.shopType || '';

  // State - Table
  const [deleteId, setDeleteId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<ICategory[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const debouncedSearch = useDebounce(globalFilterValue, 500);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);

  const fetchCats = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await adminStoreService.fetchCategories(restaurantId);
      setCategories(res);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  // Realtime channel
  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel('categories-sync-' + restaurantId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurants',
          filter: `id=eq.${restaurantId}`,
        },
        () => {
          fetchCats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, fetchCats]);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilterValue(e.target.value);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleCategoryRowClick = (id: string) => {
    setSubCategoryParentId(id);
    setIsSubCategoryModalOpen((prev) => !prev);
  };

  const handleDelete = async () => {
    if (!deleteId || !restaurantId) return;
    try {
      setMutationLoading(true);
      const updated = categories.filter((c) => c._id !== deleteId);
      await adminStoreService.saveCategories(restaurantId, updated);
      setCategories(updated);
      showToast({
        type: 'success',
        title: t('Delete Category'),
        message: `${t('Category has been deleted successfully')}.`,
        duration: 3000,
      });
      setDeleteId('');
    } catch {
      showToast({
        type: 'error',
        title: t('Delete Category'),
        message: t('An error occured while deleteing the category, please try again later'),
      });
    } finally {
      setMutationLoading(false);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    if (!debouncedSearch) return true;
    return c.title.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const menuItems: IActionMenuItem<ICategory>[] = [
    {
      label: t('Edit'),
      command: (data?: ICategory) => {
        if (data) {
          setIsAddCategoryVisible(true);
          setCategory(data);
          setSubCategories([]);
        }
      },
    },
    {
      label: t('Delete'),
      command: (data?: ICategory) => {
        if (data) {
          setDeleteId(data._id);
        }
      },
    },
    ...(shopType === 'grocery'
      ? [
          {
            label: t('View Sub-Categories'),
            command: (data?: ICategory) => {
              if (data && data._id) {
                handleCategoryRowClick(data?._id);
              }
            },
          },
        ]
      : []),
  ];

  return (
    <div className="p-3">
      <SubCategoriesPreiwModal
        isSubCategoryModalOpen={isSubCategoryModalOpen}
        setIsSubCategoryModalOpen={setIsSubCategoryModalOpen}
        subCategoryParentId={subCategoryParentId}
      />
      <Table
        header={
          <CategoryTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
          />
        }
        data={filteredCategories}
        setSelectedData={setSelectedProducts}
        selectedData={selectedProducts}
        loading={loading}
        columns={CATEGORY_TABLE_COLUMNS({
          menuItems,
          setIsAddSubCategoriesVisible,
          shopType: shopType,
        })}
        totalRecords={filteredCategories.length}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rowCount) => {
          setCurrentPage(page);
          setRowsPerPage(rowCount);
        }}
      />
      <CustomDialog
        loading={mutationLoading}
        visible={!!deleteId}
        onHide={() => {
          setDeleteId('');
        }}
        onConfirm={handleDelete}
        message={t('Are you sure you want to delete this category?')}
      />
    </div>
  );
}
