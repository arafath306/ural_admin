
import React, { useContext, useEffect, useState, useDeferredValue } from 'react';
import CustomDataView from '@/lib/ui/useable-components/data-view';
import RatingsHeaderDataView from '../header/table-header';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import RatingSkeleton from '@/lib/ui/useable-components/custom-skeletons/rating.card.skeleton';
import { IReview } from '@/lib/utils/interfaces';
import { useTranslations } from 'next-intl';
import { adminReviewService } from '@/lib/supabase/services/adminReviewService';
import useToast from '@/lib/hooks/useToast';

const RatingMain: React.FC = () => {
  const t = useTranslations();
  const { showToast } = useToast();

  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [reviews, setReviews] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const { restaurantId } = restaurantLayoutContextData;
  const debouncedSearch = useDeferredValue(searchTerm);

  const ratingRange = selectedActions.length === 1 ? selectedActions[0] : undefined;
  const minRating = ratingRange === '1-2 stars' ? 1 : ratingRange === '3-4 stars' ? 3 : ratingRange === '5 stars' ? 5 : undefined;
  const maxRating = ratingRange === '1-2 stars' ? 2 : ratingRange === '3-4 stars' ? 4 : ratingRange === '5 stars' ? 5 : undefined;

  const fetchReviews = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const { data, count } = await adminReviewService.getReviews(restaurantId, currentPage, rowsPerPage, debouncedSearch, minRating, maxRating);
      setReviews(data.map(r => ({
        _id: r.id,
        order: { orderId: r.orders?.order_id || r.order_id },
        customer: { name: r.users?.name || 'Customer' },
        rating: r.rating,
        description: r.description,
        createdAt: r.created_at
      })));
      setTotalRecords(count);
    } catch (err: any) {
      showToast({ type: 'error', title: t('Error'), message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [restaurantId, currentPage, rowsPerPage, debouncedSearch, ratingRange]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, ratingRange]);

  if (loading) return <RatingSkeleton />;

  return (
    <div className="p-3">
      {!reviews.length ? (
        <div className="text-center">
          <p className="mt-8 text-gray-600 dark:text-white">{t('No records found')}</p>
        </div>
      ) : (
        <CustomDataView
          products={reviews as IReview[]}
          header={
            <RatingsHeaderDataView
              setSelectedActions={setSelectedActions}
              selectedActions={selectedActions}
              onSearch={setSearchTerm}
            />
          }
          rows={rowsPerPage}
          totalRecords={totalRecords}
          first={(currentPage - 1) * rowsPerPage}
          lazy
          onPage={(event: any) => {
            setCurrentPage(Math.floor(event.first / event.rows) + 1);
            setRowsPerPage(event.rows);
          }}
        />
      )}
    </div>
  );
};
export default RatingMain;
