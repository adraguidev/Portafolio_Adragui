import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import AdminLayout from '@/components/layout/AdminLayout';
import ProjectEditor from '@/components/admin/ProjectEditor';
import { Project } from '@shared/schema';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ProjectManagement = () => {
  const [isCreateRoute] = useRoute('/admin/projects/new');
  const [isEditRoute, params] = useRoute('/admin/projects/edit/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  // Set page title
  useEffect(() => {
    document.title = 'Panel de Control';
  }, []);

  // Get projects
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      setProjectToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // If we're on the create route, show the editor
  if (isCreateRoute) {
    return (
      <AdminLayout>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-clash font-bold text-3xl text-primary">
              Create New Project
            </h1>
            <Button
              variant="outline"
              onClick={() => setLocation('/admin/projects')}
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Projects
            </Button>
          </div>
        </div>
        <ProjectEditor />
      </AdminLayout>
    );
  }

  // If we're on the edit route, show the editor with the project id
  if (isEditRoute && params.id) {
    const projectId = parseInt(params.id);

    return (
      <AdminLayout>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-clash font-bold text-3xl text-primary">
              Edit Project
            </h1>
            <Button
              variant="outline"
              onClick={() => setLocation('/admin/projects')}
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Projects
            </Button>
          </div>
        </div>
        <ProjectEditor projectId={projectId} />
      </AdminLayout>
    );
  }

  // Otherwise, show the project list
  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="font-clash font-bold text-3xl text-primary">
            Project Management
          </h1>
          <Button onClick={() => setLocation('/admin/projects/new')}>
            <i className="ri-add-line mr-2"></i>
            Add New Project
          </Button>
        </div>
        <p className="text-text/70">Manage your portfolio projects</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <div className="aspect-[16/9] relative">
                <Skeleton className="w-full h-full" />
              </div>
              <CardHeader className="p-4 pb-0">
                <Skeleton className="h-6 w-3/4 mb-2" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-6 w-20 rounded" />
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-20 mr-2" />
                <Skeleton className="h-10 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col h-full">
              <div className="aspect-[16/9] relative overflow-hidden">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <i className="ri-image-line text-4xl"></i>
                  </div>
                )}
                {project.featured && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">Featured</Badge>
                  </div>
                )}
              </div>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg">{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.map((tech, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-slate-100"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setLocation(`/admin/projects/edit/${project.id}`)
                  }
                >
                  <i className="ri-edit-line mr-1"></i>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setProjectToDelete(project.id)}
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
            <p className="text-muted-foreground">No projects yet.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setLocation('/admin/projects/new')}
            >
              Add your first project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={projectToDelete !== null}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                projectToDelete && deleteProjectMutation.mutate(projectToDelete)
              }
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ProjectManagement;
