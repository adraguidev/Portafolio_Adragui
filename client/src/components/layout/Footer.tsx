import { Link } from 'wouter';
import { NAV_ITEMS, SOCIAL_LINKS } from '@/lib/constants';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="font-clash font-bold text-2xl">AM.</span>
            </div>
            <p className="text-white/70 max-w-md mb-6">Creating digital experiences that combine beautiful design with powerful functionality.</p>
            <div className="flex space-x-4">
              <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent transition-colors">
                <i className="ri-github-fill text-xl"></i>
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent transition-colors">
                <i className="ri-linkedin-fill text-xl"></i>
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent transition-colors">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a href={SOCIAL_LINKS.dribbble} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent transition-colors">
                <i className="ri-dribbble-fill text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-clash font-semibold text-lg mb-4">Navigation</h4>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-white/70 hover:text-accent transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-clash font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-white/70 hover:text-accent transition-colors">Cookie Policy</a></li>
              <li><Link to="/login" className="text-white/70 hover:text-accent transition-colors">Admin Panel</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center md:text-left md:flex md:justify-between md:items-center">
          <p className="text-white/60 text-sm">&copy; {new Date().getFullYear()} Alex Morgan. All rights reserved.</p>
          <p className="text-white/60 text-sm mt-2 md:mt-0">Made with <span className="text-accent">❤</span> in San Francisco</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
