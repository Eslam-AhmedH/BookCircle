import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f0f0f] text-on-surface antialiased">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -left-[10%] -top-[10%] h-[45%] w-[45%] rounded-full bg-primary-container blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[35%] w-[35%] rounded-full bg-secondary-container blur-[100px]" />
      </div>
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
};
