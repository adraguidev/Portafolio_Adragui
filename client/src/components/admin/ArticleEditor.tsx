import { useCallback, useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertArticleSchema, Article } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useConfig } from '@/hooks/use-config';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLocation, useRoute } from 'wouter';
import { Editor } from '@tinymce/tinymce-react';

// Extended schema for article form
const articleFormSchema = insertArticleSchema.extend({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  slug: z.string().min(3, {
    message: "Slug must be at least 3 characters.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens.",
  }),
  summary: z.string().min(10, {
    message: "Summary must be at least 10 characters.",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters.",
  }),
  category: z.string().min(2, {
    message: "Category is required.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ArticleEditorProps {
  articleId?: number;
  onSuccess?: () => void;
}

const ArticleEditor = ({ articleId, onSuccess }: ArticleEditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const { config, isLoading: configLoading, error: configError } = useConfig();
  
  // Registrar en la consola el estado de la configuración
  useEffect(() => {
    console.log("TinyMCE API Key:", config?.tinymceApiKey);
    if (configError) {
      console.error("Error loading config:", configError);
    }
  }, [config, configError]);
  
  // Fetch article if editing
  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${articleId}`],
    enabled: !!articleId,
  });

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      summary: '',
      content: '',
      category: '',
      imageUrl: '',
      published: false,
    },
  });

  // Update form when article data is loaded
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        category: article.category,
        imageUrl: article.imageUrl || '',
        published: article.published,
      });
    }
  }, [article, form]);

  // Generate slug from title
  const generateSlug = useCallback(() => {
    const title = form.getValues('title');
    if (title) {
      setIsGeneratingSlug(true);
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      form.setValue('slug', slug);
      setIsGeneratingSlug(false);
    }
  }, [form]);

  // Auto-generate slug when title changes if slug is empty
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && !form.getValues('slug')) {
        generateSlug();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, generateSlug]);

  // Create article mutation
  const createArticleMutation = useMutation({
    mutationFn: (data: ArticleFormValues) => apiRequest('POST', '/api/articles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: 'Success!',
        description: 'Article created successfully.',
      });
      form.reset();
      if (onSuccess) onSuccess();
      else setLocation('/admin/articles');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create article. Please try again.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Update article mutation
  const updateArticleMutation = useMutation({
    mutationFn: (data: ArticleFormValues) => apiRequest('PUT', `/api/articles/${articleId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}`] });
      toast({
        title: 'Success!',
        description: 'Article updated successfully.',
      });
      if (onSuccess) onSuccess();
      else setLocation('/admin/articles');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update article. Please try again.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Publish/unpublish article mutations
  const publishArticleMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/articles/${articleId}/publish`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}`] });
      toast({
        title: 'Success!',
        description: 'Article published successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to publish article. Please try again.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const unpublishArticleMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/articles/${articleId}/unpublish`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}`] });
      toast({
        title: 'Success!',
        description: 'Article unpublished successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to unpublish article. Please try again.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Handle form submission
  const onSubmit = (data: ArticleFormValues) => {
    if (articleId) {
      updateArticleMutation.mutate(data);
    } else {
      createArticleMutation.mutate(data);
    }
  };

  // Handle publish/unpublish
  const handlePublishToggle = () => {
    if (articleId) {
      if (article?.published) {
        unpublishArticleMutation.mutate();
      } else {
        publishArticleMutation.mutate();
      }
    } else {
      // For new articles, just toggle the form value
      form.setValue('published', !form.getValues('published'));
    }
  };

  // Mostrar estado de carga para artículo y configuración
  if (articleId && articleLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="h-8 w-1/3 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Mostrar información de configuración para depuración
  if (configError) {
    return (
      <div className="space-y-4">
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium text-red-500 mb-2">Error de Configuración</h3>
            <p className="text-sm text-red-400 mb-4">No se pudo cargar la configuración para el editor TinyMCE.</p>
            <pre className="text-xs bg-slate-100 p-4 rounded">{JSON.stringify(configError, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Article title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 items-end">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="article-slug" {...field} />
                    </FormControl>
                    <FormDescription>Used in the URL: /articles/your-slug</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateSlug}
                disabled={isGeneratingSlug}
                className="mb-[22px]"
              >
                Generate
              </Button>
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. JavaScript, Design, Career" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publish Status</FormLabel>
                    <FormDescription>
                      {field.value ? 'Article is published and visible to visitors' : 'Article is saved as draft and only visible to you'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={handlePublishToggle}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief summary of the article"
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>This will appear in article cards.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <div className="border rounded-md overflow-hidden">
                      <Editor
                        apiKey='sgy24c3iupqsw4zbfohornkara6rs1tls4ru2asaibl1xt3f'
                        value={field.value}
                        onEditorChange={(content) => {
                          field.onChange(content);
                        }}
                        init={{
                          height: 500,
                          menubar: true,
                          plugins: [
                            // Plugins básicos
                            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 
                            'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'advlist', 'preview',
                            'fullscreen', 'hr', 'insertdatetime', 'code', 'help'
                          ],
                          toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                            'bold italic underline strikethrough | link image media table | ' +
                            'align lineheight | numlist bullist indent outdent | ' +
                            'emoticons charmap | removeformat | help',
                          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                          branding: false,
                          promotion: false
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Usa el editor para dar formato a tu contenido con negritas, listas, enlaces y más.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation('/admin/articles')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
          >
            {createArticleMutation.isPending || updateArticleMutation.isPending
              ? 'Saving...'
              : articleId
              ? 'Update Article'
              : 'Create Article'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ArticleEditor;
