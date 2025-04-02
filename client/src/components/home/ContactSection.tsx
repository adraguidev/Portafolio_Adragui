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

const formSchema = insertMessageSchema.extend({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { data: siteInfo } = useQuery({
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
        title: 'Message sent!',
        description: 'Thanks for reaching out. I\'ll get back to you soon.',
        variant: 'default',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Failed to send message',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20">
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
                  <h2 className="font-clash font-bold text-3xl md:text-4xl text-white mb-6">Let's Connect</h2>
                  <p className="text-white/80 mb-8">Have a project in mind or want to discuss opportunities? Drop me a message and I'll get back to you as soon as possible.</p>
                  
                  <div className="space-y-6 mt-auto">
                    <div className="flex items-center text-white/90">
                      <i className="ri-mail-line text-accent text-xl mr-4"></i>
                      <span>{siteInfo?.contactEmail || 'hello@alexmorgan.dev'}</span>
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
                      <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <i className="ri-github-fill"></i>
                      </a>
                      <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <i className="ri-linkedin-fill"></i>
                      </a>
                      <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <i className="ri-twitter-fill"></i>
                      </a>
                      <a href={SOCIAL_LINKS.dribbble} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <i className="ri-dribbble-fill"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 md:p-12 bg-white">
                <h3 className="font-clash font-semibold text-2xl text-primary mb-6">Send a Message</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-text/80">Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your name" 
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
                          <FormLabel className="text-sm font-medium text-text/80">Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Your email address" 
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
                          <FormLabel className="text-sm font-medium text-text/80">Subject</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="What is this regarding?" 
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
                          <FormLabel className="text-sm font-medium text-text/80">Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={5} 
                              placeholder="Your message" 
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
                      {isSubmitting ? 'Sending...' : 'Send Message'}
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
