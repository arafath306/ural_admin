
import { Sidebar } from 'primereact/sidebar';
export default function CouponAddForm({ visible, onHide }: any) {
  return (
    <Sidebar visible={visible} onHide={onHide} position="right">
      <div className="p-4"><h3>Add Coupon (Supabase)</h3></div>
    </Sidebar>
  );
}
