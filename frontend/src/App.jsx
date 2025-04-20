//frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Scan from './pages/Scan';
import ScanLog from './pages/ScanLog';
import ProductLogs from './pages/ProductLogs';
import BarcodeScannerModal from './pages/BarcodeScannerModal';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/edit/:id" element={<EditProduct />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/scan-log" element={<ScanLog/>} />
          <Route path="/product-log" element={<ProductLogs/>} />
          <Route path="/modalscanner" element={<BarcodeScannerModal/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
