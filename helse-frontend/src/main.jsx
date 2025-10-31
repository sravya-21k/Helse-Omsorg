import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import App from "./App.jsx";

import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import ServiceDetail from "./pages/ServiceDetail.jsx";
import Contact from "./pages/Contact.jsx"

import "./styles/index.css";
import "./styles/ServiceDetail.css";
import "./components/ServiceInfo.jsx"



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,                // layout
    children: [
      { index: true, element: <Home /> },            // 👈 renders at "/"
      { path: "services", element: <Services /> },
      { path: "services/:id", element: <ServiceDetail /> },
      { path:"/contact", element:<Contact />},
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
