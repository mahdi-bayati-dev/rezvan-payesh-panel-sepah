// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";

import { router } from "@/routes/index";
import { store } from "@/store/index";
import { ThemeProvider } from "./providers/ThemeProvider"; // مطمئن شوید این import صحیح است

import "./styles/index.css";
import "./styles/fonts.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
