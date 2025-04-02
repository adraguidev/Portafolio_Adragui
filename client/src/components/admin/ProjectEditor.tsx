import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Project, insertProjectSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

// Extended schema for project form
const projectFormSchema = insertProjectSchema.extend({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')),
  projectUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')),
  technologies: z.array(z.string()).min(1, {
    message: "Add at least one technology.",
  }),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectEditorProps {
  projectId?: number;
  onSuccess?: () => void;
}

const ProjectEditor = ({ projectId, onSuccess }: ProjectEditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [newTech, setNewTech] = useState('');
  
  // Fetch project if editing
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      technologies: [],
      featured: false,
      order: 0,
    },
  });

  // Update form when project data is loaded
  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl || '',
        projectUrl: project.projectUrl || '',
        technologies: project.technologies || [],
        featured: project.featured,
        order: project.order,
      });
    }
  }, [project, form]);

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => apiRequest('POST', '/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Success!',
        description: 'Project created successfully.',
      });
      form.reset();
      if (onSuccess) onSuccess();
      else setLocation('/admin/projects');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => apiRequest('PUT', `/api/projects/${projectId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      toast({
        title: 'Success!',
        description: 'Project updated successfully.',
      });
      if (onSuccess) onSuccess();
      else setLocation('/admin/projects');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Handle form submission
  const onSubmit = (data: ProjectFormValues) => {
    if (projectId) {
      updateProjectMutation.mutate(data);
    } else {
      createProjectMutation.mutate(data);
    }
  };

  // Handle adding technologies
  const addTechnology = () => {
    if (newTech.trim()) {
      const currentTechs = form.getValues('technologies') || [];
      if (!currentTechs.includes(newTech.trim())) {
        form.setValue('technologies', [...currentTechs, newTech.trim()]);
        form.clearErrors('technologies');
      }
      setNewTech('');
    }
  };

  // Handle removing technologies
  const removeTechnology = (tech: string) => {
    const currentTechs = form.getValues('technologies') || [];
    form.setValue(
      'technologies',
      currentTechs.filter(t => t !== tech)
    );
  };

  // Handle technology input keydown
  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology();
    }
  };

  if (projectId && projectLoading) {
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
                    <Input placeholder="Project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the project..."
                      className="resize-none h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="projectUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="technologies"
              render={() => (
                <FormItem>
                  <FormLabel>Technologies Used</FormLabel>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md mb-2 min-h-[100px]">
                    {form.watch('technologies')?.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-sm py-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
                          className="ml-1 rounded-full hover:bg-primary/20 p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {(!form.watch('technologies') || form.watch('technologies').length === 0) && (
                      <span className="text-muted-foreground text-sm">Add technologies using the input below</span>
                    )}
                  </div>
                  {form.formState.errors.technologies && (
                    <FormMessage>{form.formState.errors.technologies.message}</FormMessage>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="e.g. React, TypeScript, Tailwind"
                      className="flex-1"
                      onKeyDown={handleTechKeyDown}
                    />
                    <Button type="button" onClick={addTechnology}>Add</Button>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Project</FormLabel>
                    <FormDescription>
                      Featured projects appear on the homepage
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Lower numbers appear first
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
            onClick={() => setLocation('/admin/projects')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
          >
            {createProjectMutation.isPending || updateProjectMutation.isPending
              ? 'Saving...'
              : projectId
              ? 'Update Project'
              : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectEditor;
