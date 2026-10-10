import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Categories from "./pages/Categories";
import Banners from "./pages/Banners";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import CategoryForm from "./pages/CategoryForm";
import BannerForm from "./pages/BannerForm";
import VideoAds from "./pages/VideoAds";
import VideoAdForm from "./pages/VideoAdForm";
import ColorSize from "./pages/ColorSize";

export default function App() {
  return (
    <Routes>

      {/* ============================================
          ADMIN LOGIN
          ============================================ */}

      <Route
        path="/admin/login"
        element={<Login />}
      />

      {/* ============================================
          PROTECTED ADMIN PANEL
          ============================================ */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}
        <Route
          index
          element={<Dashboard />}
        />

        {/* Products */}
        <Route
          path="products"
          element={<Products />}
        />

        <Route
          path="products/new"
          element={<ProductForm />}
        />

        <Route
          path="products/:id/edit"
          element={<ProductForm />}
        />

        {/* Categories */}
        <Route
          path="categories"
          element={<Categories />}
        />

        <Route
          path="categories/new"
          element={<CategoryForm />}
        />

        <Route
          path="categories/:id/edit"
          element={<CategoryForm />}
        />

        {/* Banners */}
        <Route
  path="banners"
  element={<Banners />}
/>

<Route
  path="banners/new"
  element={<BannerForm />}
/>

<Route
  path="banners/:id/edit"
  element={<BannerForm />}
/>

<Route
  path="orders"
  element={<Orders />}
/>

<Route
  path="orders/:id"
  element={<OrderDetails />}
/>

        {/* Video Advertisements */}
        <Route
          path="video-ads"
          element={<VideoAds />}
        />
        <Route
          path="video-ads/new"
          element={<VideoAdForm />}
        />
        <Route
          path="video-ads/:id/edit"
          element={<VideoAdForm />}
        />

        {/* Inventory */}
        <Route
          path="inventory"
          element={<Inventory />}
        />

        {/* Colors & Sizes */}
        <Route
          path="colors-sizes"
          element={<ColorSize />}
        />

      </Route>

      {/* ============================================
          FALLBACK
          ============================================ */}

      <Route
        path="*"
        element={
          <Navigate
            to="/admin"
            replace
          />
        }
      />

    </Routes>
  );
}
