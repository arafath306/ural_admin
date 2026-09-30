
import { Sidebar } from 'primereact/sidebar';
export default function BannersAddForm({ isAddBannerVisible, onHide }: any) {
  return (
    <Sidebar visible={isAddBannerVisible} onHide={onHide} position="right">
      <div className="p-4"><h3>Add Banner (Supabase)</h3><p>Banner form disabled temporarily during migration.</p></div>
    </Sidebar>
  );
}
