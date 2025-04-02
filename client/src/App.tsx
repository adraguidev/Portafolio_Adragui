import { Switch, Route } from "wouter";
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
import ArticleDetail from "@/pages/ArticleDetail";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/articles/:slug" component={ArticleDetail} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminHome} />
      <Route path="/admin/cv" component={CVManagement} />
      <Route path="/admin/articles" component={ArticleManagement} />
      <Route path="/admin/projects" component={ProjectManagement} />
      <Route path="/admin/messages" component={Messages} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
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
