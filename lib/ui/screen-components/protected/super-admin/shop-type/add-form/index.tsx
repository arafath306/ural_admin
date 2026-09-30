
import { Sidebar } from 'primereact/sidebar';
export default function ShopTypeAddForm({ visible, onHide }: any) {
  return <Sidebar visible={visible} onHide={onHide} position="right"><div className="p-4"><h3>Add Shop Type</h3></div></Sidebar>;
}
