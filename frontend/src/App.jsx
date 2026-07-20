import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductManagement from "./pages/ProductManagement";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import Waste from "./pages/Waste";
import Transfer from "./pages/Transfer";
import Movements from "./pages/Movements";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/stock-in" element={<StockIn />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/stock-out" element={<StockOut />} />
        <Route path="/waste" element={<Waste />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/movements" element={<Movements />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;