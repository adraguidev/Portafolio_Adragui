import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

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
        description: 'La información del sitio ha sido actualizada correctamente',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la información del sitio',
        variant: 'destructive'
      });
      console.error('Error updating site info:', error);
    }
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
      a.download = `portfolio-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: 'Exportación completada',
        description: 'Los datos del portafolio han sido exportados correctamente',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error de exportación',
        description: 'No se pudieron exportar los datos del portafolio',
        variant: 'destructive'
      });
      console.error('Error exporting data:', error);
    }
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
        description: 'Los datos del portafolio han sido importados correctamente',
        variant: 'default'
      });
    },
    onError: (error) => {
      setIsImporting(false);
      toast({
        title: 'Error de importación',
        description: 'No se pudieron importar los datos del portafolio',
        variant: 'destructive'
      });
      console.error('Error importing data:', error);
    }
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
        dribbble: formData.get('dribbble') as string
      }
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
          variant: 'destructive'
        });
        setIsImporting(false);
        console.error('Error parsing JSON:', error);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'Error al leer el archivo',
        description: 'No se pudo leer el archivo seleccionado',
        variant: 'destructive'
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
          <h1 className="text-2xl font-clash font-bold text-primary">Configuración del Sitio</h1>
          <p className="text-slate-500">Gestiona la información general y configura tu portafolio</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="import-export">Importar/Exportar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información del Sitio</CardTitle>
                <CardDescription>Actualiza la información general que se muestra en tu portafolio</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="siteInfoForm" onSubmit={handleSiteInfoSubmit} className="space-y-6">
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
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  form="siteInfoForm"
                  disabled={updateSiteInfoMutation.isPending}
                  className="ml-auto"
                >
                  {updateSiteInfoMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
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
                  <CardDescription>Descarga una copia completa de todos los datos de tu portafolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    Esta operación exportará todos tus proyectos, artículos, experiencia, educación, habilidades y configuración del sitio en un archivo JSON.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => exportDataMutation.mutate()} 
                    disabled={exportDataMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {exportDataMutation.isPending ? 'Exportando...' : 'Exportar datos'}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Importar datos */}
              <Card>
                <CardHeader>
                  <CardTitle>Importar Datos</CardTitle>
                  <CardDescription>Carga un archivo de datos exportado previamente</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    ¡Precaución! Esta operación sobrescribirá todos los datos actuales con los del archivo importado.
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
                        disabled={!selectedFile || isImporting || importDataMutation.isPending}
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
                          Esta acción sobrescribirá todos los datos actuales de tu portafolio. Esta operación no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImport}>Continuar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;