
import { Sidebar } from 'primereact/sidebar';
export default function CuisineAddForm({ visible, onHide }: any) {
  return <Sidebar visible={visible} onHide={onHide} position="right"><div className="p-4"><h3>Add Cuisine</h3></div></Sidebar>;
}
