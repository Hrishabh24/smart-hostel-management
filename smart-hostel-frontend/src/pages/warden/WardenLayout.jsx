import { Outlet } from "react-router-dom";
import WardenSidebar from "../../components/WardenSidebar";

function WardenLayout() {
  return (
    <div className="flex bg-[#0B0F19]">
      <WardenSidebar />
      <div className="flex-1 p-4 md:p-10 w-full max-w-full overflow-x-hidden min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}

export default WardenLayout;