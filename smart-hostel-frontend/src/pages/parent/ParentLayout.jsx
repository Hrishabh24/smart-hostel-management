import { Outlet } from "react-router-dom";
import ParentSidebar from "../../components/ParentSidebar";

function ParentLayout() {
  return (
    <div className="flex bg-[#0B0F19]">
      <ParentSidebar />
      <div className="flex-1 p-10">
        <Outlet />
      </div>
    </div>
  );
}

export default ParentLayout;
