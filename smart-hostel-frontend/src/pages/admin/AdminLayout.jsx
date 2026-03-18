import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";

function AdminLayout() {
  return (
    <div className="flex bg-[#0B0F19]">
      <AdminSidebar />
      <div className="flex-1 p-10">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
