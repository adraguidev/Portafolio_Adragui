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
    <section id="contact" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <motion.h2
            className="font-clash font-bold text-4xl md:text-5xl text-primary mb-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {t('home.contactTitle')}
          </motion.h2>
          <motion.p
            className="text-text/70 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t('home.contactDescription')}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            className="bg-white rounded-lg p-8 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="font-clash font-semibold text-xl mb-4">
              {t('home.contactInfo')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <i className="ri-mail-line text-secondary text-xl mr-4"></i>
                <a
                  href="mailto:contact@adragui.com"
                  className="text-text/70 hover:text-secondary transition-colors"
                >
                  contact@adragui.com
                </a>
              </div>
              <div className="flex items-center">
                <i className="ri-map-pin-line text-secondary text-xl mr-4"></i>
                <span className="text-text/70">
                  {t('home.location')}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg p-8 shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="font-clash font-semibold text-xl mb-4">
              {t('home.socialMedia')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <i className="ri-github-line text-secondary text-xl mr-4"></i>
                <a
                  href="https://github.com/adragui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text/70 hover:text-secondary transition-colors"
                >
                  GitHub
                </a>
              </div>
              <div className="flex items-center">
                <i className="ri-linkedin-line text-secondary text-xl mr-4"></i>
                <a
                  href="https://linkedin.com/in/adragui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text/70 hover:text-secondary transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
