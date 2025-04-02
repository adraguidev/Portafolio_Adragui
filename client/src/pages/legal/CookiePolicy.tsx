import { useEffect } from 'react';
import { Link } from 'wouter';

const CookiePolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-clash font-bold text-4xl md:text-5xl text-primary mb-8">Política de Cookies</h1>
        
        <p className="text-text/70 mb-8">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-lg max-w-none">
          <h2>1. ¿Qué son las Cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que los sitios web que visitas colocan en tu ordenador para 
            mejorar tu experiencia en el sitio web. Esta práctica es común en casi todos los sitios web.
          </p>
          <p>
            Cuando visitas nuestro sitio web, es posible que guardemos cookies en tu navegador por varias razones. 
            Principalmente, utilizamos cookies para recordar tus preferencias y entender cómo interactúas con nuestro sitio.
          </p>

          <h2>2. Tipos de Cookies que Utilizamos</h2>
          <p>
            Nuestro sitio utiliza varios tipos de cookies por diferentes razones:
          </p>
          <ul>
            <li><strong>Cookies Esenciales:</strong> Estas cookies son necesarias para que el sitio web funcione y no se pueden desactivar en nuestros sistemas. Generalmente se establecen en respuesta a acciones realizadas por ti que equivalen a una solicitud de servicios, como establecer tus preferencias de privacidad, iniciar sesión o rellenar formularios. Puedes configurar tu navegador para bloquear o alertarte sobre estas cookies, pero algunas partes del sitio no funcionarán.</li>
            <li><strong>Cookies de Rendimiento:</strong> Estas cookies nos permiten contar las visitas y fuentes de tráfico para que podamos medir y mejorar el rendimiento de nuestro sitio. Nos ayudan a saber qué páginas son las más y menos populares y ver cómo se mueven los visitantes por el sitio. Toda la información que estas cookies recopilan es agregada y, por lo tanto, anónima.</li>
            <li><strong>Cookies de Funcionalidad:</strong> Estas cookies permiten que el sitio proporcione funcionalidades y personalización mejoradas. Pueden ser establecidas por nosotros o por terceros proveedores cuyos servicios hemos añadido a nuestras páginas. Si no permites estas cookies, algunos o todos estos servicios pueden no funcionar correctamente.</li>
            <li><strong>Cookies de Publicidad:</strong> Estas cookies pueden ser establecidas a través de nuestro sitio por nuestros socios publicitarios. Pueden ser utilizadas por esas empresas para construir un perfil de tus intereses y mostrarte anuncios relevantes en otros sitios. No almacenan directamente información personal, sino que se basan en la identificación única de tu navegador y dispositivo de Internet.</li>
          </ul>

          <h2>3. Cómo Controlar las Cookies</h2>
          <p>
            Puedes controlar y/o eliminar las cookies como desees. Puedes eliminar todas las cookies que ya están en tu 
            ordenador y puedes configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si haces 
            esto, es posible que tengas que ajustar manualmente algunas preferencias cada vez que visites un sitio y algunos 
            servicios y funcionalidades pueden no funcionar.
          </p>
          <p>
            La mayoría de los navegadores web te permiten controlar las cookies a través de sus configuraciones de 'preferencias'. 
            Los navegadores web pueden configurarse para rechazar las cookies o avisarte cuando un sitio web intenta poner una 
            cookie en tu computadora.
          </p>
          <p>
            Para saber más sobre las cookies, incluyendo cómo ver qué cookies se han establecido y cómo gestionarlas y 
            eliminarlas, visita <a href="http://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">www.allaboutcookies.org</a>.
          </p>

          <h2>4. Cookies de Terceros</h2>
          <p>
            En algunos casos especiales, también utilizamos cookies proporcionadas por terceros de confianza. La siguiente 
            sección detalla qué cookies de terceros puedes encontrar a través de este sitio.
          </p>
          <ul>
            <li>Este sitio utiliza Google Analytics, que es una de las soluciones de análisis más extendidas y fiables en la 
              web, para ayudarnos a entender cómo utilizas el sitio y las formas en que podemos mejorar tu experiencia. 
              Estas cookies pueden rastrear cosas como cuánto tiempo pasas en el sitio y las páginas que visitas, para que 
              podamos seguir produciendo contenido atractivo.</li>
            <li>De vez en cuando probamos nuevas características y hacemos cambios sutiles en la forma en que se entrega el sitio. 
              Cuando todavía estamos probando nuevas características, estas cookies pueden usarse para asegurar que recibas una 
              experiencia consistente mientras estás en el sitio, mientras entendemos qué optimizaciones aprecian más nuestros usuarios.</li>
          </ul>

          <h2>5. Más Información</h2>
          <p>
            Esperamos que esto haya aclarado las cosas para ti. Como se mencionó anteriormente, si hay algo que no estás 
            seguro de si necesitas o no, generalmente es más seguro dejar las cookies habilitadas en caso de que interactúen 
            con una de las funciones que utilizas en nuestro sitio.
          </p>
          <p>
            Sin embargo, si todavía estás buscando más información, puedes contactarnos a través de uno de nuestros métodos 
            de contacto preferidos.
          </p>

          <h2>6. Contacto</h2>
          <p>
            Si tienes alguna pregunta sobre nuestra Política de Cookies, por favor <Link href="/contact" className="text-secondary hover:underline">contáctanos</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;