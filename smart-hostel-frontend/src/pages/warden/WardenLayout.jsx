import { Outlet } from "react-router-dom";
import WardenSidebar from "../../components/WardenSidebar";

function WardenLayout() {
  return (
    <div className="flex bg-[#0B0F19]">
      <WardenSidebar />
      <div className="flex-1 p-10">
        <Outlet />
      </div>
    </div>
  );
}

export default WardenLayout;