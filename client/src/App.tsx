import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import AdminHome from "@/pages/admin/AdminHome";
import CVManagement from "@/pages/admin/CVManagement";
import ArticleManagement from "@/pages/admin/ArticleManagement";
import ProjectManagement from "@/pages/admin/ProjectManagement";
import Messages from "@/pages/admin/Messages";
import Settings from "@/pages/admin/Settings";
import ArticleDetail from "@/pages/ArticleDetail";
import ArticlesPage from "@/pages/ArticlesPage";
import ProjectsPage from "@/pages/ProjectsPage";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import TermsOfService from "@/pages/legal/TermsOfService";
import CookiePolicy from "@/pages/legal/CookiePolicy";
import Layout from "@/components/layout/Layout";

// Componente wrapper para añadir el Layout a las rutas públicas
const PublicRoute = ({ component: Component, ...rest }: { component: React.ComponentType<any>, path?: string }) => {
  return (
    <Route
      {...rest}
      component={(props: any) => (
        <Layout>
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

// Componente wrapper para rutas de administración
const AdminRoute = ({ component: Component, ...rest }: { component: React.ComponentType<any>, path?: string }) => {
  return <Route {...rest} component={Component} />;
};

function Router() {
  const [location] = useLocation();
  
  // Comprueba si estamos en una ruta de administración
  const isAdminRoute = location.startsWith('/admin');
  
  return (
    <Switch>
      {/* Public Routes */}
      <PublicRoute path="/" component={Home} />
      <Route path="/login" component={Login} />
      <PublicRoute path="/projects" component={ProjectsPage} />
      <PublicRoute path="/articles" component={ArticlesPage} />
      <PublicRoute path="/articles/:slug" component={ArticleDetail} />
      
      {/* Legal Routes */}
      <PublicRoute path="/privacy-policy" component={PrivacyPolicy} />
      <PublicRoute path="/terms-of-service" component={TermsOfService} />
      <PublicRoute path="/cookie-policy" component={CookiePolicy} />
      
      {/* Admin Routes */}
      <AdminRoute path="/admin" component={AdminHome} />
      <AdminRoute path="/admin/cv" component={CVManagement} />
      <AdminRoute path="/admin/articles" component={ArticleManagement} />
      <AdminRoute path="/admin/projects" component={ProjectManagement} />
      <AdminRoute path="/admin/messages" component={Messages} />
      <AdminRoute path="/admin/settings" component={Settings} />
      
      {/* Fallback to 404 */}
      <PublicRoute component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
