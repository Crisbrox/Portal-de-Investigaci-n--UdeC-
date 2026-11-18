/**
 * App.jsx — Rutas del Portal UdeC
 *
 * Público:  / | /tienda | /vitrina | /repositorio | /isu | /estadisticas | /acceso
 * Panel:    /panel (+ subrutas protegidas)
 * Admin:    /panel/auditoria | /panel/matriz-excel | /panel/usuarios
 * Por rol:  investigador → producción científica · emprendedor → emprendimientos y mi tienda
 *           ISU → proyectos de Interacción Social Universitaria y sus entregables
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import Carrito from './components/Carrito';
import { PublicLayout, PanelLayout } from './components/Layouts';
import ProtectedRoute from './components/ProtectedRoute';
import { Cursor, ScrollSuave } from './components/efectos';

import Home from './pages/Home';
import Tienda from './pages/Tienda';
import VitrinaEmprendimientos from './pages/VitrinaEmprendimientos';
import RepositorioInvestigacion from './pages/RepositorioInvestigacion';
import IsuPublico from './pages/IsuPublico';
import Estadisticas from './pages/Estadisticas';
import Acceso from './pages/Acceso';

import Panel from './pages/Panel';
import MisProductos from './pages/MisProductos';
import DetalleProducto from './pages/DetalleProducto';
import RegistrarProducto from './pages/RegistrarProducto';
import PublicarEmprendimiento from './pages/PublicarEmprendimiento';
import Auditoria from './pages/Auditoria';
import MatrizExcel from './pages/MatrizExcel';
import Usuarios from './pages/Usuarios';
import CambiarPassword from './pages/CambiarPassword';
import MiTienda from './pages/MiTienda';
import IsuProyectos from './pages/IsuProyectos';
import IsuMatriz from './pages/IsuMatriz';

const INVESTIGACION = ['INVESTIGADOR'];
const EMPRENDIMIENTO = ['EMPRENDEDOR'];
const ISU = ['ISU'];

/** Atajo para envolver una página con la guarda de rol. */
const conRol = (roles, pagina) => <ProtectedRoute roles={roles}>{pagina}</ProtectedRoute>;
const soloAdmin = (pagina) => <ProtectedRoute adminOnly>{pagina}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <ScrollSuave />
        <Cursor />
        <Carrito />
        <Routes>
          {/* ---------- Rutas públicas ---------- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/vitrina" element={<VitrinaEmprendimientos />} />
            <Route path="/repositorio" element={<RepositorioInvestigacion />} />
            <Route path="/isu" element={<IsuPublico />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="/acceso" element={<Acceso />} />
          </Route>

          {/* ---------- Panel autenticado ---------- */}
          <Route
            path="/panel"
            element={
              <ProtectedRoute>
                <PanelLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Panel />} />
            <Route path="cambiar-password" element={<CambiarPassword />} />

            {/* Investigador */}
            <Route path="mis-productos" element={conRol(INVESTIGACION, <MisProductos />)} />
            <Route path="producto/:id" element={conRol(INVESTIGACION, <DetalleProducto />)} />
            <Route path="registrar-producto" element={conRol(INVESTIGACION, <RegistrarProducto />)} />

            {/* Emprendedor */}
            <Route path="publicar-emprendimiento" element={conRol(EMPRENDIMIENTO, <PublicarEmprendimiento />)} />
            <Route path="mi-tienda" element={conRol(EMPRENDIMIENTO, <MiTienda />)} />

            {/* ISU */}
            <Route path="isu" element={conRol(ISU, <IsuProyectos />)} />

            {/* Solo Admin */}
            <Route path="auditoria" element={soloAdmin(<Auditoria />)} />
            <Route path="usuarios" element={soloAdmin(<Usuarios />)} />
            <Route path="matriz-excel" element={soloAdmin(<MatrizExcel />)} />
            <Route path="isu/matriz" element={soloAdmin(<IsuMatriz />)} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CarritoProvider>
    </AuthProvider>
  );
}
