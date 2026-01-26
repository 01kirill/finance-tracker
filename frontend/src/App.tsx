import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Activate } from './pages/Activate';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate/:uid/:token" element={<Activate />} />
        <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
