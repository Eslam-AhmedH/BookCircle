import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppProviders } from "./app/providers";
import { AppRouter } from "./app/routes/AppRouter";
import { ToastContainer } from "./shared/ui/Toast";




createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
      <ToastContainer />
    </AppProviders>
  </StrictMode>,
);
