import { Link } from 'wouter';
import { NAV_ITEMS, SOCIAL_LINKS } from '@/lib/constants';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="font-clash font-bold text-2xl">AA.</span>
            </div>
            <p className="text-white/70 max-w-md mb-6">Creando experiencias digitales que combinan un diseño hermoso con una funcionalidad potente.</p>
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
            <h4 className="font-clash font-semibold text-lg mb-4">Navegación</h4>
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
              <li><a href="#" className="text-white/70 hover:text-accent transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="text-white/70 hover:text-accent transition-colors">Términos de Servicio</a></li>
              <li><a href="#" className="text-white/70 hover:text-accent transition-colors">Política de Cookies</a></li>
              <li><Link to="/login" className="text-white/70 hover:text-accent transition-colors">Panel de Administración</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center md:text-left md:flex md:justify-between md:items-center">
          <p className="text-white/60 text-sm">&copy; {new Date().getFullYear()} Adrián Aguirre. Todos los derechos reservados.</p>
          <p className="text-white/60 text-sm mt-2 md:mt-0">Hecho con <span className="text-accent">❤</span> en San Francisco</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
