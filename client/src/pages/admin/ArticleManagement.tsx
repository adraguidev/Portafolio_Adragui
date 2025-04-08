import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import AdminLayout from '@/components/layout/AdminLayout';
import ArticleEditor from '@/components/admin/ArticleEditor';
import { Article } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ArticleManagement = () => {
  const [isCreateRoute] = useRoute('/admin/articles/new');
  const [isEditRoute, params] = useRoute('/admin/articles/edit/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('published');
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);

  // Set page title
  useEffect(() => {
    document.title = 'Panel de Control';
  }, []);

  // Get articles
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  // Mutations
  const publishArticleMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('POST', `/api/articles/${id}/publish`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: 'Success',
        description: 'Article published successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to publish article',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const unpublishArticleMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('POST', `/api/articles/${id}/unpublish`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: 'Success',
        description: 'Article unpublished successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to unpublish article',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: 'Success',
        description: 'Article deleted successfully',
      });
      setArticleToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete article',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Filter articles by published status
  const publishedArticles =
    articles?.filter((article) => article.published) || [];
  const draftArticles = articles?.filter((article) => !article.published) || [];

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // If we're on the create route, show the editor
  if (isCreateRoute) {
    return (
      <AdminLayout>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-clash font-bold text-3xl text-primary">
              Create New Article
            </h1>
            <Button
              variant="outline"
              onClick={() => setLocation('/admin/articles')}
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Articles
            </Button>
          </div>
        </div>
        <ArticleEditor />
      </AdminLayout>
    );
  }

  // If we're on the edit route, show the editor with the article id
  if (isEditRoute && params.id) {
    const articleId = parseInt(params.id);

    return (
      <AdminLayout>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-clash font-bold text-3xl text-primary">
              Edit Article
            </h1>
            <Button
              variant="outline"
              onClick={() => setLocation('/admin/articles')}
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Articles
            </Button>
          </div>
        </div>
        <ArticleEditor articleId={articleId} />
      </AdminLayout>
    );
  }

  // Otherwise, show the article list
  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="font-clash font-bold text-3xl text-primary">
            Article Management
          </h1>
          <Button onClick={() => setLocation('/admin/articles/new')}>
            <i className="ri-add-line mr-2"></i>
            Create New Article
          </Button>
        </div>
        <p className="text-text/70">Manage your blog articles</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="published">
            Published ({publishedArticles.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({draftArticles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, index) => (
                <Card key={index}>
                  <CardHeader className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-10 w-20 mr-2" />
                    <Skeleton className="h-10 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : publishedArticles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {publishedArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {article.category}
                      </Badge>
                    </div>
                    <CardDescription>
                      Published:{' '}
                      {article.publishedAt
                        ? formatDate(article.publishedAt)
                        : 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        unpublishArticleMutation.mutate(article.id)
                      }
                      disabled={unpublishArticleMutation.isPending}
                    >
                      <i className="ri-eye-off-line mr-1"></i>
                      Unpublish
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLocation(`/admin/articles/edit/${article.id}`)
                      }
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setArticleToDelete(article.id)}
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No published articles yet.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setLocation('/admin/articles/new')}
                >
                  Create your first article
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="drafts">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(2)].map((_, index) => (
                <Card key={index}>
                  <CardHeader className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-10 w-20 mr-2" />
                    <Skeleton className="h-10 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : draftArticles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {draftArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {article.category}
                      </Badge>
                    </div>
                    <CardDescription>
                      Last updated: {formatDate(article.updatedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => publishArticleMutation.mutate(article.id)}
                      disabled={publishArticleMutation.isPending}
                    >
                      <i className="ri-eye-line mr-1"></i>
                      Publish
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLocation(`/admin/articles/edit/${article.id}`)
                      }
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setArticleToDelete(article.id)}
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No draft articles.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setLocation('/admin/articles/new')}
                >
                  Create a new article
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={articleToDelete !== null}
        onOpenChange={(open) => !open && setArticleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                articleToDelete && deleteArticleMutation.mutate(articleToDelete)
              }
              disabled={deleteArticleMutation.isPending}
            >
              {deleteArticleMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ArticleManagement;
