import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Experience, 
  Education, 
  Skill, 
  insertExperienceSchema, 
  insertEducationSchema, 
  insertSkillSchema 
} from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Experience Form Schema
const experienceFormSchema = insertExperienceSchema.extend({
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().optional(),
});

// Education Form Schema
const educationFormSchema = insertEducationSchema.extend({
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().optional(),
});

// Skill Form Schema
const skillFormSchema = insertSkillSchema.extend({
  items: z.array(z.string()).min(1, { message: 'At least one skill item is required' }),
});

type ExperienceForm = z.infer<typeof experienceFormSchema>;
type EducationForm = z.infer<typeof educationFormSchema>;
type SkillForm = z.infer<typeof skillFormSchema>;

const CVEditor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('experience');
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [experienceToDelete, setExperienceToDelete] = useState<number | null>(null);
  const [educationToDelete, setEducationToDelete] = useState<number | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<number | null>(null);
  const [newSkillItem, setNewSkillItem] = useState('');
  const [skillItems, setSkillItems] = useState<string[]>([]);

  // Fetch CV data
  const { data: cvData, isLoading: cvLoading } = useQuery<{
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
  }>({
    queryKey: ['/api/cv'],
  });

  // Experience form
  const experienceForm = useForm<ExperienceForm>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: '',
      company: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      order: 0,
    },
  });

  // Education form
  const educationForm = useForm<EducationForm>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: {
      degree: '',
      institution: '',
      description: '',
      startDate: '',
      endDate: '',
      order: 0,
    },
  });

  // Skill form
  const skillForm = useForm<SkillForm>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      category: '',
      items: [],
      order: 0,
    },
  });

  // Mutations
  const createExperienceMutation = useMutation({
    mutationFn: (data: ExperienceForm) => apiRequest('POST', '/api/experiences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cv'] });
      toast({
        title: 'Success',
        description: 'Experience added successfully',
      });
      experienceForm.reset();
      setShowExperienceForm(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add experience',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const updateExperienceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExperienceForm> }) => 
      apiRequest('PUT', `/api/experiences/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cv'] });
      toast({
        title: 'Success',
        description: 'Experience updated successfully',
      });
      experienceForm.reset();
      setSelectedExperience(null);
      setShowExperienceForm(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update experience',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/experiences/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cv'] });
      toast({
        title: 'Success',
        description: 'Experience deleted successfully',
      });
      setExperienceToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete experience',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const createEducationMutation = useMutation({
    mutationFn: (data: EducationForm) => apiRequest('POST', '/api/education', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cv'] });
      toast({
        title: 'Success',
        description: 'Education added successfully',
      });
      educationForm.reset();
      setShowEducationForm(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add education',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EducationForm> }) => 
      apiRequest('PUT', `/api/education/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cv'] });
      toast({
        title: 'Success',
        description: 'Education updated successfully',
      });
      educationForm.reset();
      setSelectedEducation(null);
      setShowEducationForm(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update education',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/education/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cv'] });
      toast({
        title: 'Success',
        description: 'Education deleted successfully',
      });
      setEducationToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete education',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const createSkillMutation = useMutation({
    mutationFn: (data: SkillForm) => apiRequest('POST', '/api/skills', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cv'] });
      toast({
        title: 'Success',
        description: 'Skill category added successfully',
      });
      skillForm.reset();
      setSkillItems([]);
      setShowSkillForm(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add skill category',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SkillForm> }) => 
      apiRequest('PUT', `/api/skills/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cv'] });
      toast({
        title: 'Success',
        description: 'Skill category updated successfully',
      });
      skillForm.reset();
      setSkillItems([]);
      setSelectedSkill(null);
      setShowSkillForm(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update skill category',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cv'] });
      toast({
        title: 'Success',
        description: 'Skill category deleted successfully',
      });
      setSkillToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete skill category',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Handle form submissions
  const handleExperienceSubmit = (data: ExperienceForm) => {
    if (selectedExperience) {
      updateExperienceMutation.mutate({
        id: selectedExperience.id,
        data: data,
      });
    } else {
      createExperienceMutation.mutate(data);
    }
  };

  const handleEducationSubmit = (data: EducationForm) => {
    if (selectedEducation) {
      updateEducationMutation.mutate({
        id: selectedEducation.id,
        data: data,
      });
    } else {
      createEducationMutation.mutate(data);
    }
  };

  const handleSkillSubmit = (data: SkillForm) => {
    // Ensure we're using the items from state
    const formData = {
      ...data,
      items: skillItems
    };
    
    if (selectedSkill) {
      updateSkillMutation.mutate({
        id: selectedSkill.id,
        data: formData,
      });
    } else {
      createSkillMutation.mutate(formData);
    }
  };

  // Edit functions
  const handleEditExperience = (experience: Experience) => {
    setSelectedExperience(experience);
    experienceForm.reset({
      title: experience.title,
      company: experience.company,
      description: experience.description,
      startDate: experience.startDate,
      endDate: experience.endDate || '',
      isCurrent: experience.isCurrent,
      order: experience.order,
    });
    setShowExperienceForm(true);
  };

  const handleEditEducation = (education: Education) => {
    setSelectedEducation(education);
    educationForm.reset({
      degree: education.degree,
      institution: education.institution,
      description: education.description,
      startDate: education.startDate,
      endDate: education.endDate || '',
      order: education.order,
    });
    setShowEducationForm(true);
  };

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setSkillItems(skill.items);
    skillForm.reset({
      category: skill.category,
      items: skill.items,
      order: skill.order,
    });
    setShowSkillForm(true);
  };

  // Skill item management
  const addSkillItem = () => {
    if (newSkillItem.trim()) {
      setSkillItems([...skillItems, newSkillItem.trim()]);
      setNewSkillItem('');
    }
  };

  const removeSkillItem = (index: number) => {
    const newItems = [...skillItems];
    newItems.splice(index, 1);
    setSkillItems(newItems);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-clash font-bold text-3xl text-primary mb-2">CV Management</h1>
        <p className="text-text/70">Add, edit or remove entries in your curriculum vitae.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        {/* Experience Tab */}
        <TabsContent value="experience">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="font-clash font-semibold text-xl">Work Experience</h2>
            <Button onClick={() => {
              experienceForm.reset();
              setSelectedExperience(null);
              setShowExperienceForm(true);
            }}>
              <i className="ri-add-line mr-2"></i>
              Add Experience
            </Button>
          </div>

          {cvLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-4 w-1/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cvData?.experiences && cvData.experiences.length > 0 ? (
            <div className="space-y-4">
              {cvData.experiences.map((experience) => (
                <Card key={experience.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-clash font-semibold text-lg">{experience.title}</h3>
                      <span className="bg-slate-100 text-primary/70 px-3 py-1 rounded-full text-sm">
                        {experience.startDate} - {experience.endDate || 'Present'}
                      </span>
                    </div>
                    <h4 className="text-secondary font-medium mb-2">{experience.company}</h4>
                    <p className="text-text/70 text-sm">{experience.description}</p>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => handleEditExperience(experience)}>
                        <i className="ri-edit-line mr-2"></i>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => setExperienceToDelete(experience.id)}>
                        <i className="ri-delete-bin-line mr-2"></i>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-text/70">No experience entries yet. Add your first one!</p>
              </CardContent>
            </Card>
          )}

          {/* Experience Form Dialog */}
          <Dialog open={showExperienceForm} onOpenChange={setShowExperienceForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedExperience ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
                <DialogDescription>
                  {selectedExperience ? 'Update your work experience details.' : 'Add a new work experience entry to your CV.'}
                </DialogDescription>
              </DialogHeader>

              <Form {...experienceForm}>
                <form onSubmit={experienceForm.handleSubmit(handleExperienceSubmit)} className="space-y-4">
                  <FormField
                    control={experienceForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior Web Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={experienceForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. TechCorp Solutions" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={experienceForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 2021" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={experienceForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 2023 (leave empty if current)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={experienceForm.control}
                    name="isCurrent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Current Position</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Check if this is your current job
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={experienceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your responsibilities and achievements..." 
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={experienceForm.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Lower numbers appear first" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowExperienceForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createExperienceMutation.isPending || updateExperienceMutation.isPending}>
                      {createExperienceMutation.isPending || updateExperienceMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Experience Confirmation */}
          <AlertDialog open={experienceToDelete !== null} onOpenChange={(open) => !open && setExperienceToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this experience entry.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => experienceToDelete && deleteExperienceMutation.mutate(experienceToDelete)}
                  disabled={deleteExperienceMutation.isPending}
                >
                  {deleteExperienceMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="font-clash font-semibold text-xl">Education</h2>
            <Button onClick={() => {
              educationForm.reset();
              setSelectedEducation(null);
              setShowEducationForm(true);
            }}>
              <i className="ri-add-line mr-2"></i>
              Add Education
            </Button>
          </div>

          {cvLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-4 w-1/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cvData?.education && cvData.education.length > 0 ? (
            <div className="space-y-4">
              {cvData.education.map((education) => (
                <Card key={education.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-clash font-semibold text-lg">{education.degree}</h3>
                      <span className="bg-slate-100 text-primary/70 px-3 py-1 rounded-full text-sm">
                        {education.startDate} - {education.endDate}
                      </span>
                    </div>
                    <h4 className="text-secondary font-medium mb-2">{education.institution}</h4>
                    <p className="text-text/70 text-sm">{education.description}</p>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => handleEditEducation(education)}>
                        <i className="ri-edit-line mr-2"></i>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => setEducationToDelete(education.id)}>
                        <i className="ri-delete-bin-line mr-2"></i>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-text/70">No education entries yet. Add your first one!</p>
              </CardContent>
            </Card>
          )}

          {/* Education Form Dialog */}
          <Dialog open={showEducationForm} onOpenChange={setShowEducationForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedEducation ? 'Edit Education' : 'Add Education'}</DialogTitle>
                <DialogDescription>
                  {selectedEducation ? 'Update your education details.' : 'Add a new education entry to your CV.'}
                </DialogDescription>
              </DialogHeader>

              <Form {...educationForm}>
                <form onSubmit={educationForm.handleSubmit(handleEducationSubmit)} className="space-y-4">
                  <FormField
                    control={educationForm.control}
                    name="degree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. BSc Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={educationForm.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. University of Technology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={educationForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 2014" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={educationForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 2018" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={educationForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your studies, achievements, etc..." 
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={educationForm.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Lower numbers appear first" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowEducationForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createEducationMutation.isPending || updateEducationMutation.isPending}>
                      {createEducationMutation.isPending || updateEducationMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Education Confirmation */}
          <AlertDialog open={educationToDelete !== null} onOpenChange={(open) => !open && setEducationToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this education entry.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => educationToDelete && deleteEducationMutation.mutate(educationToDelete)}
                  disabled={deleteEducationMutation.isPending}
                >
                  {deleteEducationMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="font-clash font-semibold text-xl">Skills & Technologies</h2>
            <Button onClick={() => {
              skillForm.reset();
              setSelectedSkill(null);
              setSkillItems([]);
              setShowSkillForm(true);
            }}>
              <i className="ri-add-line mr-2"></i>
              Add Skill Category
            </Button>
          </div>

          {cvLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-1/4 mb-4" />
                    <div className="flex flex-wrap gap-2">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-20 rounded-md" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cvData?.skills && cvData.skills.length > 0 ? (
            <div className="space-y-4">
              {cvData.skills.map((skill) => (
                <Card key={skill.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-clash font-semibold text-lg mb-4">{skill.category}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skill.items.map((item, index) => (
                        <span key={index} className="bg-slate-100 text-primary/80 px-3 py-2 rounded-md text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSkill(skill)}>
                        <i className="ri-edit-line mr-2"></i>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => setSkillToDelete(skill.id)}>
                        <i className="ri-delete-bin-line mr-2"></i>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-text/70">No skill categories yet. Add your first one!</p>
              </CardContent>
            </Card>
          )}

          {/* Skill Form Dialog */}
          <Dialog open={showSkillForm} onOpenChange={setShowSkillForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedSkill ? 'Edit Skill Category' : 'Add Skill Category'}</DialogTitle>
                <DialogDescription>
                  {selectedSkill ? 'Update your skill category details.' : 'Add a new skill category to your CV.'}
                </DialogDescription>
              </DialogHeader>

              <Form {...skillForm}>
                <form onSubmit={skillForm.handleSubmit(handleSkillSubmit)} className="space-y-4">
                  <FormField
                    control={skillForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Frontend, Backend, Design" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Skills</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2 p-3 border rounded-md min-h-[100px]">
                      {skillItems.map((item, index) => (
                        <span key={index} className="bg-slate-100 text-primary/80 px-2 py-1 rounded text-sm flex items-center">
                          {item}
                          <button 
                            type="button"
                            onClick={() => removeSkillItem(index)}
                            className="ml-1 text-text/40 hover:text-text/70"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </span>
                      ))}
                      {skillItems.length === 0 && (
                        <span className="text-text/40 text-sm">Add skills using the input below</span>
                      )}
                    </div>
                    {skillItems.length === 0 && skillForm.formState.errors.items && (
                      <p className="text-sm font-medium text-destructive">{skillForm.formState.errors.items.message}</p>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newSkillItem}
                        onChange={(e) => setNewSkillItem(e.target.value)}
                        placeholder="e.g. React, Node.js, Figma"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkillItem();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkillItem}>Add</Button>
                    </div>
                  </div>

                  <FormField
                    control={skillForm.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Lower numbers appear first" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowSkillForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createSkillMutation.isPending || updateSkillMutation.isPending}
                      onClick={() => {
                        // Set the items in the form before submission
                        skillForm.setValue('items', skillItems);
                      }}
                    >
                      {createSkillMutation.isPending || updateSkillMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Skill Confirmation */}
          <AlertDialog open={skillToDelete !== null} onOpenChange={(open) => !open && setSkillToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this skill category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => skillToDelete && deleteSkillMutation.mutate(skillToDelete)}
                  disabled={deleteSkillMutation.isPending}
                >
                  {deleteSkillMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CVEditor;
