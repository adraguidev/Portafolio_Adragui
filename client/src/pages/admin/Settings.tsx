import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Separator } from '@/components/ui/separator';
import { FileUp, CheckCircle, AlertCircle, Database, RefreshCw } from 'lucide-react';

// Definir tipos necesarios aquí hasta que podamos importarlos correctamente
interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  dribbble?: string;
}

interface SiteInfo {
  id: number;
  about: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactLocation: string | null;
  cvFileUrl: string | null;
  heroImageUrl: string | null;
  socialLinks: SocialLinks | null;
}

interface PortfolioData {
  projects: any[];
  experiences: any[];
  education: any[];
  skills: any[];
  articles: any[];
  siteInfo?: SiteInfo;
}

const Settings = () => {
  const { toast } = useToast();
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState<{
    total: number;
    completed: number;
    errors: number;
  } | null>(null);

  // Set page title
  useEffect(() => {
    document.title = 'Panel de Control';
  }, []);

  // Consulta para obtener la información del sitio
  const { data: siteInfo, isLoading } = useQuery<SiteInfo>({
    queryKey: ['/api/site-info'],
  });

  // Mutación para actualizar la información del sitio
  const updateSiteInfoMutation = useMutation({
    mutationFn: async (updatedInfo: Partial<SiteInfo>) => {
      try {
        console.log('Enviando datos:', JSON.stringify(updatedInfo));
        // Cambiado de PATCH a PUT para coincidir con la ruta del servidor
        const res = await apiRequest('PUT', '/api/site-info', updatedInfo);
        const data = await res.json();
        console.log('Respuesta:', data);
        return data;
      } catch (error) {
        console.error('Error en la mutación:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-info'] });
      toast({
        title: 'Configuración actualizada',
        description:
          'La información del sitio ha sido actualizada correctamente',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la información del sitio',
        variant: 'destructive',
      });
      console.error('Error updating site info:', error);
    },
  });

  // Mutación para exportar los datos
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('GET', '/api/export');
      return await res.json();
    },
    onSuccess: (data) => {
      // Crear y descargar el archivo JSON
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      setExportUrl(url);

      // Crear y hacer clic en un enlace de descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-export-${
        new Date().toISOString().split('T')[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: 'Exportación completada',
        description:
          'Los datos del portafolio han sido exportados correctamente',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error de exportación',
        description: 'No se pudieron exportar los datos del portafolio',
        variant: 'destructive',
      });
      console.error('Error exporting data:', error);
    },
  });

  // Mutación para importar los datos
  const importDataMutation = useMutation({
    mutationFn: async (importData: PortfolioData) => {
      const res = await apiRequest('POST', '/api/import', importData);
      return await res.json();
    },
    onSuccess: (data) => {
      setIsImporting(false);
      setSelectedFile(null);

      // Invalidar todas las consultas para reflejar los datos importados
      queryClient.invalidateQueries();

      toast({
        title: 'Importación completada',
        description:
          'Los datos del portafolio han sido importados correctamente',
        variant: 'default',
      });
    },
    onError: (error) => {
      setIsImporting(false);
      toast({
        title: 'Error de importación',
        description: 'No se pudieron importar los datos del portafolio',
        variant: 'destructive',
      });
      console.error('Error importing data:', error);
    },
  });

  const handleSiteInfoSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const updatedInfo = {
      about: formData.get('about') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: formData.get('contactPhone') as string,
      contactLocation: formData.get('contactLocation') as string,
      socialLinks: {
        github: formData.get('github') as string,
        linkedin: formData.get('linkedin') as string,
        twitter: formData.get('twitter') as string,
        dribbble: formData.get('dribbble') as string,
      },
    };

    updateSiteInfoMutation.mutate(updatedInfo);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importDataMutation.mutate(data);
      } catch (error) {
        toast({
          title: 'Error al leer el archivo',
          description: 'El archivo seleccionado no es un JSON válido',
          variant: 'destructive',
        });
        setIsImporting(false);
        console.error('Error parsing JSON:', error);
      }
    };

    reader.onerror = () => {
      toast({
        title: 'Error al leer el archivo',
        description: 'No se pudo leer el archivo seleccionado',
        variant: 'destructive',
      });
      setIsImporting(false);
    };

    reader.readAsText(selectedFile);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-clash font-bold text-primary">
            Configuración del Sitio
          </h1>
          <p className="text-slate-500">
            Gestiona la información general y configura tu portafolio
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="import-export">Importar/Exportar</TabsTrigger>
            <TabsTrigger value="translations">Traducciones</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información del Sitio</CardTitle>
                <CardDescription>
                  Actualiza la información general que se muestra en tu
                  portafolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  id="siteInfoForm"
                  onSubmit={handleSiteInfoSubmit}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="about">Acerca de mí</Label>
                      <Textarea
                        id="about"
                        name="about"
                        rows={4}
                        defaultValue={siteInfo?.about || ''}
                        placeholder="Una breve descripción sobre ti y tu trabajo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactEmail">Email de contacto</Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        defaultValue={siteInfo?.contactEmail || ''}
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Teléfono de contacto</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        defaultValue={siteInfo?.contactPhone || ''}
                        placeholder="+1 (123) 456-7890"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactLocation">Ubicación</Label>
                      <Input
                        id="contactLocation"
                        name="contactLocation"
                        type="text"
                        defaultValue={siteInfo?.contactLocation || ''}
                        placeholder="Ciudad, País"
                      />
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-semibold">Redes Sociales</h3>

                    <div>
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        name="github"
                        type="url"
                        defaultValue={siteInfo?.socialLinks?.github || ''}
                        placeholder="https://github.com/tu-usuario"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        defaultValue={siteInfo?.socialLinks?.linkedin || ''}
                        placeholder="https://linkedin.com/in/tu-perfil"
                      />
                    </div>

                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        name="twitter"
                        type="url"
                        defaultValue={siteInfo?.socialLinks?.twitter || ''}
                        placeholder="https://twitter.com/tu-usuario"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dribbble">Dribbble</Label>
                      <Input
                        id="dribbble"
                        name="dribbble"
                        type="url"
                        defaultValue={siteInfo?.socialLinks?.dribbble || ''}
                        placeholder="https://dribbble.com/tu-usuario"
                      />
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-semibold">Imagen del Héroe</h3>
                    <div className="mt-2">
                      <Label>Imagen actual en la sección inicial</Label>
                      <div className="mt-2 flex items-center gap-2">
                        {siteInfo?.heroImageUrl ? (
                          <>
                            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md flex-1">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-sm truncate max-w-[250px]">
                                Imagen personalizada
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateSiteInfoMutation.mutate({
                                  heroImageUrl: null,
                                });
                                toast({
                                  title: 'Imagen restablecida',
                                  description:
                                    'Se ha vuelto a la imagen predeterminada',
                                  variant: 'default',
                                });
                              }}
                            >
                              Restablecer predeterminada
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md flex-1">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <span className="text-sm">
                              Usando imagen predeterminada
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-semibold">
                      Currículum Vitae (CV)
                    </h3>
                    <div className="mt-2">
                      <Label>Archivo CV actual</Label>
                      <div className="mt-2 flex items-center gap-2">
                        {siteInfo?.cvFileUrl ? (
                          <>
                            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md flex-1">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-sm truncate max-w-[250px]">
                                {siteInfo.cvFileUrl.split('/').pop()}
                              </span>
                            </div>
                            <a
                              href={`/api/cv/download`}
                              target="_blank"
                              className="px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
                            >
                              Descargar
                            </a>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md flex-1">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <span className="text-sm">
                              No hay ningún archivo CV cargado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>

                {/* Formulario para usar URL de imagen del héroe */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold mb-4">
                    Cambiar imagen del héroe
                  </h3>

                  {/* Mostrar la imagen actual si existe */}
                  {siteInfo?.heroImageUrl && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-md">
                      <p className="text-sm font-medium mb-2">Imagen actual:</p>
                      <div className="relative w-full max-w-[200px] aspect-square mb-3 mx-auto">
                        <img
                          src={siteInfo.heroImageUrl}
                          alt="Imagen actual del héroe"
                          className="w-full h-full object-cover rounded-md border border-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(
                        e.target as HTMLFormElement
                      );
                      const imageUrl = formData.get('imageUrl') as string;

                      if (!imageUrl) {
                        toast({
                          title: 'Error',
                          description:
                            'Por favor, ingresa una URL de imagen válida',
                          variant: 'destructive',
                        });
                        return;
                      }

                      fetch('/api/hero-image/url', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${localStorage.getItem(
                            'token'
                          )}`,
                        },
                        body: JSON.stringify({ imageUrl }),
                      })
                        .then((response) => {
                          if (!response.ok) {
                            throw new Error(
                              'Error al establecer la URL de la imagen'
                            );
                          }
                          return response.json();
                        })
                        .then((data) => {
                          toast({
                            title: 'URL establecida correctamente',
                            description:
                              'La imagen del héroe ha sido actualizada',
                            variant: 'default',
                          });
                          queryClient.invalidateQueries({
                            queryKey: ['/api/site-info'],
                          });

                          // Limpiar el input de URL
                          const urlInput = document.getElementById(
                            'imageUrl'
                          ) as HTMLInputElement;
                          if (urlInput) {
                            urlInput.value = '';
                          }
                        })
                        .catch((error) => {
                          toast({
                            title: 'Error',
                            description:
                              error.message ||
                              'No se pudo establecer la URL de la imagen',
                            variant: 'destructive',
                          });
                        });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="imageUrl">URL de la imagen</Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        type="url"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Ingresa la URL completa de una imagen. Se recomienda una
                        imagen de aspecto 1:1.
                      </p>
                    </div>

                    <Button type="submit" className="w-full" size="sm">
                      <FileUp className="mr-2 h-4 w-4" /> Usar URL de imagen
                    </Button>
                  </form>

                  {/* Botón para restaurar la imagen por defecto */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-3">
                      ¿Quieres volver a la imagen por defecto? Puedes
                      restaurarla con un solo clic.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Confirmar antes de restaurar
                        if (
                          confirm(
                            '¿Estás seguro que deseas restaurar la imagen por defecto?'
                          )
                        ) {
                          fetch('/api/hero-image/reset', {
                            method: 'POST',
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                'token'
                              )}`,
                            },
                          })
                            .then((response) => {
                              if (!response.ok) {
                                throw new Error('Error al restaurar la imagen');
                              }
                              return response.json();
                            })
                            .then((data) => {
                              toast({
                                title: 'Imagen restaurada',
                                description:
                                  'Se ha restaurado la imagen por defecto',
                                variant: 'default',
                              });
                              queryClient.invalidateQueries({
                                queryKey: ['/api/site-info'],
                              });
                            })
                            .catch((error) => {
                              toast({
                                title: 'Error',
                                description:
                                  error.message ||
                                  'No se pudo restaurar la imagen',
                                variant: 'destructive',
                              });
                            });
                        }
                      }}
                    >
                      Restaurar imagen por defecto
                    </Button>
                  </div>
                </div>

                {/* Formulario para cambiar el CV */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold mb-4">Cambiar CV</h3>

                  {/* Tabs para elegir entre subir archivo o usar URL */}
                  <Tabs defaultValue="url" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="url">Usar URL</TabsTrigger>
                      <TabsTrigger value="upload">Subir archivo</TabsTrigger>
                    </TabsList>

                    {/* Tab para usar URL */}
                    <TabsContent value="url">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(
                            e.target as HTMLFormElement
                          );
                          const cvUrl = formData.get('cvUrl') as string;

                          if (!cvUrl) {
                            toast({
                              title: 'Error',
                              description: 'Por favor, ingresa una URL válida',
                              variant: 'destructive',
                            });
                            return;
                          }

                          fetch('/api/cv/url', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${localStorage.getItem(
                                'token'
                              )}`,
                            },
                            body: JSON.stringify({ cvUrl }),
                          })
                            .then((response) => {
                              if (!response.ok) {
                                throw new Error(
                                  'Error al establecer la URL del CV'
                                );
                              }
                              return response.json();
                            })
                            .then((data) => {
                              toast({
                                title: 'URL establecida correctamente',
                                description:
                                  'La URL del CV ha sido actualizada',
                                variant: 'default',
                              });
                              queryClient.invalidateQueries({
                                queryKey: ['/api/site-info'],
                              });
                              queryClient.invalidateQueries({
                                queryKey: ['/api/cv'],
                              });

                              // Limpiar el input de URL
                              const urlInput = document.getElementById(
                                'cvUrl'
                              ) as HTMLInputElement;
                              if (urlInput) {
                                urlInput.value = '';
                              }
                            })
                            .catch((error) => {
                              toast({
                                title: 'Error',
                                description:
                                  error.message ||
                                  'No se pudo establecer la URL del CV',
                                variant: 'destructive',
                              });
                            });
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="cvUrl">URL del CV</Label>
                          <Input
                            id="cvUrl"
                            name="cvUrl"
                            type="url"
                            placeholder="https://ejemplo.com/mi-cv.pdf"
                            className="mt-1"
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Ingresa la URL completa de tu CV. Se recomienda un
                            archivo PDF.
                          </p>
                        </div>

                        <Button type="submit" className="w-full" size="sm">
                          Establecer URL del CV
                        </Button>
                      </form>
                    </TabsContent>

                    {/* Tab para subir archivo */}
                    <TabsContent value="upload">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(
                            e.target as HTMLFormElement
                          );

                          // Para FormData, no debemos establecer Content-Type, el navegador lo hará automáticamente
                          fetch('/api/cv/upload', {
                            method: 'POST',
                            body: formData,
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                'token'
                              )}`,
                            },
                          })
                            .then((response) => {
                              if (!response.ok) {
                                throw new Error('Error al subir el archivo');
                              }
                              return response.json();
                            })
                            .then((data) => {
                              toast({
                                title: 'CV subido correctamente',
                                description:
                                  'El archivo CV ha sido actualizado',
                                variant: 'default',
                              });
                              queryClient.invalidateQueries({
                                queryKey: ['/api/site-info'],
                              });
                              queryClient.invalidateQueries({
                                queryKey: ['/api/cv'],
                              });

                              // Limpiar el input de archivo
                              const fileInput = document.getElementById(
                                'cvFile'
                              ) as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = '';
                              }
                            })
                            .catch((error) => {
                              toast({
                                title: 'Error',
                                description:
                                  error.message ||
                                  'No se pudo subir el archivo CV',
                                variant: 'destructive',
                              });
                            });
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="cvFile">Seleccionar archivo CV</Label>
                          <Input
                            id="cvFile"
                            name="cvFile"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="cursor-pointer mt-1"
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Formatos aceptados: PDF, DOC, DOCX. Tamaño máximo:
                            5MB
                          </p>
                        </div>

                        <Button type="submit" className="w-full" size="sm">
                          <FileUp className="mr-2 h-4 w-4" /> Subir CV
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  {/* Botón para eliminar el CV actual */}
                  {siteInfo?.cvFileUrl && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-500 hover:text-red-600"
                        onClick={() => {
                          fetch('/api/cv/reset', {
                            method: 'POST',
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                'token'
                              )}`,
                            },
                          })
                            .then((response) => {
                              if (!response.ok) {
                                throw new Error('Error al eliminar el CV');
                              }
                              return response.json();
                            })
                            .then((data) => {
                              toast({
                                title: 'CV eliminado',
                                description:
                                  'El CV ha sido eliminado correctamente',
                                variant: 'default',
                              });
                              queryClient.invalidateQueries({
                                queryKey: ['/api/site-info'],
                              });
                              queryClient.invalidateQueries({
                                queryKey: ['/api/cv'],
                              });
                            })
                            .catch((error) => {
                              toast({
                                title: 'Error',
                                description:
                                  error.message || 'No se pudo eliminar el CV',
                                variant: 'destructive',
                              });
                            });
                        }}
                      >
                        Eliminar CV actual
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  form="siteInfoForm"
                  disabled={updateSiteInfoMutation.isPending}
                  className="ml-auto"
                >
                  {updateSiteInfoMutation.isPending
                    ? 'Guardando...'
                    : 'Guardar cambios'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="import-export">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Exportar datos */}
              <Card>
                <CardHeader>
                  <CardTitle>Exportar Datos</CardTitle>
                  <CardDescription>
                    Descarga una copia completa de todos los datos de tu
                    portafolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Esta operación exportará todos tus proyectos, artículos,
                    experiencia, educación, habilidades y configuración del
                    sitio en un archivo JSON.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => exportDataMutation.mutate()}
                    disabled={exportDataMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {exportDataMutation.isPending
                      ? 'Exportando...'
                      : 'Exportar datos'}
                  </Button>
                </CardFooter>
              </Card>

              {/* Importar datos */}
              <Card>
                <CardHeader>
                  <CardTitle>Importar Datos</CardTitle>
                  <CardDescription>
                    Carga un archivo de datos exportado previamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    ¡Precaución! Esta operación sobrescribirá todos los datos
                    actuales con los del archivo importado.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="importFile">Seleccionar archivo</Label>
                      <Input
                        id="importFile"
                        name="importFile"
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        disabled={isImporting}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={
                          !selectedFile ||
                          isImporting ||
                          importDataMutation.isPending
                        }
                        variant="destructive"
                        className="w-full"
                      >
                        {isImporting ? 'Importando...' : 'Importar datos'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción sobrescribirá todos los datos actuales de
                          tu portafolio. Esta operación no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImport}>
                          Continuar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="translations">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Gestión de caché de traducciones */}
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de caché</CardTitle>
                  <CardDescription>
                    Limpiar la caché de traducciones almacenada en Redis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Esta operación eliminará todas las traducciones almacenadas en caché.
                    Útil cuando hay problemas con traducciones desactualizadas o incorrectas.
                  </p>
                </CardContent>
                <CardFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                      >
                        <Database className="mr-2 h-4 w-4" /> Limpiar caché de traducciones
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará toda la caché de traducciones de Redis Cloud.
                          Las traducciones se regenerarán a medida que los usuarios accedan al sitio,
                          lo que puede ralentizar temporalmente el rendimiento.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          toast({
                            title: 'Limpiando caché',
                            description: 'Esto puede tomar unos segundos...',
                            variant: 'default',
                          });
                          
                          apiRequest('POST', '/api/translations/clear-cache')
                            .then((res) => res.json())
                            .then((data) => {
                              toast({
                                title: 'Caché limpiada',
                                description: `Se han eliminado ${data.keysDeleted || 0} entradas de la caché de traducciones`,
                                variant: 'default',
                              });
                            })
                            .catch((error) => {
                              toast({
                                title: 'Error',
                                description: 'No se pudo limpiar la caché de traducciones',
                                variant: 'destructive',
                              });
                              console.error('Error clearing translation cache:', error);
                            });
                        }}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>

              {/* Precargar traducciones */}
              <Card>
                <CardHeader>
                  <CardTitle>Precargar traducciones</CardTitle>
                  <CardDescription>
                    Generar y almacenar en caché traducciones para el contenido estático
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Esta operación traducirá todo el contenido estático a todos los idiomas soportados
                    y almacenará los resultados en caché. Las traducciones se procesarán en lotes
                    para mayor eficiencia.
                  </p>
                  <div className="flex items-center p-2 mb-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
                    <i className="ri-information-line mr-2 text-amber-500"></i>
                    <p className="text-xs">
                      Este proceso puede tardar varios minutos. Las traducciones se harán mediante procesamiento
                      por lotes para maximizar la eficiencia y reducir el tiempo total.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button
                    onClick={() => {
                      setPreloadProgress({ total: 0, completed: 0, errors: 0 });
                      
                      toast({
                        title: 'Precargando traducciones',
                        description: 'El proceso ha comenzado y puede tardar varios minutos. Puedes seguir el progreso en esta página.',
                        variant: 'default',
                        duration: 10000,
                      });
                      
                      // Crear un intervalo para verificar el progreso
                      const progressCheckerId = setInterval(async () => {
                        try {
                          const res = await apiRequest('GET', '/api/translations/status');
                          const status = await res.json();
                          
                          if (status && status.inProgress) {
                            setPreloadProgress({
                              total: status.totalTexts || 0,
                              completed: status.completedTexts || 0,
                              errors: status.errorCount || 0
                            });
                          }
                        } catch (e) {
                          // Silenciar errores de la verificación de estado
                          console.log('Error al verificar estado:', e);
                        }
                      }, 3000);
                      
                      apiRequest('POST', '/api/translations/preload')
                        .then((res) => res.json())
                        .then((data) => {
                          // Detener el intervalo
                          clearInterval(progressCheckerId);
                          
                          // Actualizar el estado final
                          setPreloadProgress(null);
                          
                          if (data.errors > 0) {
                            toast({
                              title: 'Traducciones precargadas con advertencias',
                              description: `Se han precargado ${data.count || 0} traducciones con ${data.errors || 0} errores. Los errores no afectan al funcionamiento.`,
                              variant: 'default',
                              duration: 8000,
                            });
                          } else {
                            toast({
                              title: 'Traducciones precargadas',
                              description: `Se han precargado ${data.count || 0} traducciones correctamente`,
                              variant: 'default',
                            });
                          }
                        })
                        .catch((error) => {
                          // Detener el intervalo
                          clearInterval(progressCheckerId);
                          
                          // Restablecer el estado de progreso
                          setPreloadProgress(null);
                          
                          toast({
                            title: 'Error al precargar traducciones',
                            description: error.message || 'Intenta reducir el número de traducciones o intentarlo más tarde.',
                            variant: 'destructive',
                            duration: 8000,
                          });
                          console.error('Error preloading translations:', error);
                        });
                    }}
                    variant="outline"
                    className="w-full mb-2"
                    disabled={!!preloadProgress}
                  >
                    {preloadProgress ? (
                      <>
                        <div className="animate-spin mr-2">
                          <RefreshCw className="h-4 w-4" />
                        </div>
                        Precargando... {preloadProgress.completed > 0 && preloadProgress.total > 0 && 
                          `(${Math.round((preloadProgress.completed / preloadProgress.total) * 100)}%)`
                        }
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" /> Precargar todas las traducciones
                      </>
                    )}
                  </Button>
                  
                  {preloadProgress && (
                    <div className="w-full mt-3">
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                          style={{ 
                            width: `${preloadProgress.total > 0 ? Math.round((preloadProgress.completed / preloadProgress.total) * 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-slate-500">
                        <span>{preloadProgress.completed} completadas</span>
                        {preloadProgress.errors > 0 && (
                          <span className="text-amber-500">{preloadProgress.errors} errores</span>
                        )}
                        <span>Total: {preloadProgress.total}</span>
                      </div>
                    </div>
                  )}
                  
                  {!preloadProgress && (
                    <div className="w-full text-xs text-slate-500 text-center mt-2">
                      Español → {['Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Japonés', 'Chino'].join(' • ')}
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
            
            {/* Información sobre el sistema de traducción */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Información del sistema de traducción</CardTitle>
                <CardDescription>
                  Detalles sobre cómo funciona el sistema de traducciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-medium mb-2">Optimización de traducciones</h3>
                    <p className="text-sm text-slate-600">
                      El sistema utiliza un procesamiento por lotes (batching) que agrupa múltiples 
                      solicitudes de traducción en una sola llamada a la API, reduciendo 
                      significativamente el tiempo de procesamiento y los costos.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-2">Caché en Redis</h3>
                    <p className="text-sm text-slate-600">
                      Todas las traducciones se almacenan en Redis Cloud durante 30 días, lo que 
                      permite una carga más rápida del sitio y reduce las llamadas a la API.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-2">Idiomas soportados</h3>
                    <p className="text-sm text-slate-600">
                      El sistema soporta actualmente traducciones entre español y: inglés, francés, alemán, 
                      italiano, portugués, japonés y chino. El español es el idioma base de todas las traducciones.
                    </p>
                  </div>
                  
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-md">
                    <p className="text-xs text-slate-600">
                      <strong>Nota:</strong> La precarga de traducciones puede generar costos por el uso de la API de DeepSeek. 
                      Se recomienda hacerlo solo cuando sea necesario, como después de actualizar contenido estático 
                      o añadir nuevos idiomas al sistema.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
