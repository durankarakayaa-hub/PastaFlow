import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";

import ProductManagement from "./pages/ProductManagement";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import Waste from "./pages/Waste";
import Transfer from "./pages/Transfer";
import Movements from "./pages/Movements";
import Reports from "./pages/Reports";
import LogoImport from "./pages/LogoImport";
import Settings from "./pages/Settings";
import BranchManagement from "./pages/BranchManagement";
import UserManagement from "./pages/UserManagement";


// =========================================================
// KORUMALI SAYFA
// =========================================================

function ProtectedRoute({ children }) {

  const token = localStorage.getItem(
    "pastaflow_token"
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// =========================================================
// YÖNETİCİ SAYFASI
// =========================================================

function AdminRoute({ children }) {

  const token = localStorage.getItem(
    "pastaflow_token"
  );

  const user = JSON.parse(
    localStorage.getItem("pastaflow_user") || "null"
  );

  const role = user?.role || "";

  const isAdmin =
    role === "ADMIN" ||
    role === "YÖNETİCİ" ||
    role === "YONETICI";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}


// =========================================================
// APP
// =========================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* DASHBOARD */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* STOK */}

        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <Stock />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock-in"
          element={
            <ProtectedRoute>
              <StockIn />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock-out"
          element={
            <ProtectedRoute>
              <StockOut />
            </ProtectedRoute>
          }
        />


        {/* ÜRÜN */}

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductManagement />
            </ProtectedRoute>
          }
        />


        {/* İMHA */}

        <Route
          path="/waste"
          element={
            <ProtectedRoute>
              <Waste />
            </ProtectedRoute>
          }
        />


        {/* TRANSFER */}

        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <Transfer />
            </ProtectedRoute>
          }
        />


        {/* HAREKETLER */}

        <Route
          path="/movements"
          element={
            <ProtectedRoute>
              <Movements />
            </ProtectedRoute>
          }
        />


        {/* RAPORLAR */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            SADECE YÖNETİCİ
        ================================================= */}

        <Route
          path="/settings"
          element={
            <AdminRoute>
              <Settings />
            </AdminRoute>
          }
        />

        <Route
          path="/branches"
          element={
            <AdminRoute>
              <BranchManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/logo-import"
          element={
            <AdminRoute>
              <LogoImport />
            </AdminRoute>
          }
        />


        {/* BİLİNMEYEN SAYFA */}

        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;