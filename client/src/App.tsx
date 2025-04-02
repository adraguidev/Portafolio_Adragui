import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { TranslationProvider } from "@/components/ui/SimpleTranslator";

// Lazy-loaded routes
const ArticleDetail = lazy(() => import("@/pages/ArticleDetail"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      
      <Route path="/articulo/:slug">
        {(params) => (
          <Suspense fallback={<div>Cargando...</div>}>
            <ArticleDetail slug={params.slug} />
          </Suspense>
        )}
      </Route>
      
      {/* 404 Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TranslationProvider>
      <Router />
    </TranslationProvider>
  );
}

export default App;