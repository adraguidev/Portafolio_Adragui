import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertMessageSchema } from '@shared/schema';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SOCIAL_LINKS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const formSchema = insertMessageSchema.extend({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const { data: siteInfo } = useQuery<{
    id: number;
    contactEmail: string;
    contactPhone: string;
    contactLocation: string;
    about: string;
    socialLinks: {
      github?: string;
      linkedin?: string;
      twitter?: string;
      dribbble?: string;
    };
  }>({
    queryKey: ['/api/site-info'],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/messages', data);
      toast({
        title: '¡Mensaje enviado!',
        description: 'Gracias por contactarme. Te responderé pronto.',
        variant: 'default',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Error al enviar el mensaje',
        description: 'Por favor, inténtalo de nuevo más tarde.',
        variant: 'destructive',
      });
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 bg-[url('https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center relative">
                <div className="absolute inset-0 bg-primary/90"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <h2 className="font-clash font-bold text-3xl md:text-4xl text-white mb-6">Conectemos</h2>
                  <p className="text-white/80 mb-8">¿Tienes un proyecto en mente o quieres hablar sobre oportunidades? Envíame un mensaje y te responderé lo antes posible.</p>
                  
                  <div className="space-y-6 mt-auto">
                    <div className="flex items-center text-white/90">
                      <i className="ri-mail-line text-accent text-xl mr-4"></i>
                      <span>{siteInfo?.contactEmail || 'hello@example.com'}</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <i className="ri-phone-line text-accent text-xl mr-4"></i>
                      <span>{siteInfo?.contactPhone || '+1 (555) 123-4567'}</span>
                    </div>
                    <div className="flex items-center text-white/90">
                      <i className="ri-map-pin-line text-accent text-xl mr-4"></i>
                      <span>{siteInfo?.contactLocation || 'San Francisco, CA'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <div className="flex space-x-4">
                      {(siteInfo?.socialLinks?.github || SOCIAL_LINKS.github) && (
                        <a href={siteInfo?.socialLinks?.github || SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                          <i className="ri-github-fill"></i>
                        </a>
                      )}
                      {(siteInfo?.socialLinks?.linkedin || SOCIAL_LINKS.linkedin) && (
                        <a href={siteInfo?.socialLinks?.linkedin || SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                          <i className="ri-linkedin-fill"></i>
                        </a>
                      )}
                      {(siteInfo?.socialLinks?.twitter || SOCIAL_LINKS.twitter) && (
                        <a href={siteInfo?.socialLinks?.twitter || SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                          <i className="ri-twitter-fill"></i>
                        </a>
                      )}
                      {(siteInfo?.socialLinks?.dribbble || SOCIAL_LINKS.dribbble) && (
                        <a href={siteInfo?.socialLinks?.dribbble || SOCIAL_LINKS.dribbble} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                          <i className="ri-dribbble-fill"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 md:p-12 bg-slate-900 text-white">
                <h3 className="font-clash font-semibold text-2xl text-white mb-6">{t('contact.getInTouch')}</h3>
                <p className="text-white/80 mb-8">
                  {t('contact.getInTouchDescription')}
                </p>
                
                <div className="space-y-6">
                  {siteInfo?.contactLocation && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-white/10 rounded-full p-3 mt-1">
                        <i className="ri-map-pin-2-line text-accent text-xl"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-1">{t('contact.addressLabel')}</h4>
                        <p className="text-white/80">{siteInfo.contactLocation}</p>
                      </div>
                    </div>
                  )}
                  
                  {siteInfo?.contactEmail && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-white/10 rounded-full p-3 mt-1">
                        <i className="ri-mail-line text-accent text-xl"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-1">{t('contact.emailLabel')}</h4>
                        <a href={`mailto:${siteInfo.contactEmail}`} className="text-white/80 hover:text-accent transition-colors">{siteInfo.contactEmail}</a>
                      </div>
                    </div>
                  )}
                  
                  {siteInfo?.contactPhone && (
                    <div className="flex items-start space-x-3">
                      <div className="bg-white/10 rounded-full p-3 mt-1">
                        <i className="ri-phone-line text-accent text-xl"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-1">{t('contact.phoneLabel')}</h4>
                        <a href={`tel:${siteInfo.contactPhone}`} className="text-white/80 hover:text-accent transition-colors">{siteInfo.contactPhone}</a>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <h4 className="font-medium text-white mb-3">{t('contact.followMe')}</h4>
                    <div className="flex items-center space-x-3">
                      {/* ... existing code with social links ... */}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 md:p-12 bg-white">
                <h3 className="font-clash font-semibold text-2xl text-primary mb-6">{t('contact.sendMessage')}</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-text/80">{t('contact.name')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('common.yourName')}
                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-colors" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-text/80">{t('contact.email')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder={t('common.yourEmail')}
                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-colors" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-text/80">{t('common.subject')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('common.whatIsItAbout')}
                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-colors" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-text/80">{t('contact.message')}</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={5} 
                              placeholder={t('common.yourMessage')}
                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-colors resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit"
                      className="w-full bg-primary text-white rounded-md px-6 py-3 text-base font-medium hover:bg-primary/90 transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t('common.sending') : t('common.sendMessage')}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
