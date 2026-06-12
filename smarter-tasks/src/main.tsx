import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./pages/Signin.css";
import "./index.css";
import "./site.css";
import "./pm-dashboard.css";
import "./pm-status.css";
import App from "./App.tsx";
import ThemeProvider from "./theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);