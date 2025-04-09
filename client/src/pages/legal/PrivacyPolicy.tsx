import { useEffect } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-clash font-bold text-4xl md:text-5xl text-primary mb-8">{t('legal.privacyPolicy')}</h1>
        
        <p className="text-text/70 mb-8">{t('legal.lastUpdated')}: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-lg max-w-none">
          <h2>1. Información que Recopilamos</h2>
          <p>
            En Adrián Aguirre Portfolio, accesible desde este sitio web, una de nuestras principales prioridades es la privacidad de nuestros visitantes. 
            Este documento de Política de Privacidad contiene los tipos de información que recopilamos y registramos y cómo la utilizamos.
          </p>
          <p>
            Podemos recopilar la siguiente información:
          </p>
          <ul>
            <li>Información personal que nos proporcionas voluntariamente, como tu nombre y dirección de correo electrónico al utilizar nuestro formulario de contacto.</li>
            <li>Información sobre tu dispositivo y navegador, incluida tu dirección IP, tipo de navegador y sistema operativo.</li>
            <li>Información sobre cómo interactúas con nuestro sitio, como las páginas que visitas y los enlaces en los que haces clic.</li>
          </ul>

          <h2>2. Cómo Utilizamos tu Información</h2>
          <p>
            Utilizamos la información que recopilamos de las siguientes maneras:
          </p>
          <ul>
            <li>Para responder a tus consultas y solicitudes.</li>
            <li>Para personalizar tu experiencia y proporcionarte contenido relevante.</li>
            <li>Para mejorar nuestro sitio web basándonos en la información y el feedback que recibimos de ti.</li>
            <li>Para monitorear y analizar tendencias, uso y actividades relacionadas con nuestro sitio web.</li>
          </ul>

          <h2>3. Cookies y Tecnologías de Seguimiento</h2>
          <p>
            Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad en nuestro sitio web y 
            almacenar cierta información. Las cookies son archivos con una pequeña cantidad de datos que pueden incluir 
            un identificador único anónimo. Las cookies son enviadas a tu navegador desde un sitio web y almacenadas en tu dispositivo.
          </p>
          <p>
            Puedes instruir a tu navegador para que rechace todas las cookies o para que te avise cuando se envía una cookie. 
            Sin embargo, si no aceptas cookies, es posible que no puedas utilizar algunas partes de nuestro sitio web.
          </p>

          <h2>4. Proveedores de Servicios Externos</h2>
          <p>
            Podemos emplear compañías e individuos de terceros por las siguientes razones:
          </p>
          <ul>
            <li>Para facilitar nuestro servicio;</li>
            <li>Para proporcionar el servicio en nuestro nombre;</li>
            <li>Para realizar servicios relacionados con el servicio; o</li>
            <li>Para ayudarnos a analizar cómo se utiliza nuestro servicio.</li>
          </ul>
          <p>
            Queremos informar a los usuarios de este sitio web que estos terceros tienen acceso a tu Información Personal. 
            La razón es realizar las tareas asignadas a ellos en nuestro nombre. Sin embargo, están obligados a no divulgar 
            o utilizar la información para ningún otro propósito.
          </p>

          <h2>5. Seguridad</h2>
          <p>
            La seguridad de tu información personal es importante para nosotros, pero recuerda que ningún método de 
            transmisión por Internet o método de almacenamiento electrónico es 100% seguro. Si bien nos esforzamos por 
            utilizar medios comercialmente aceptables para proteger tu información personal, no podemos garantizar su 
            seguridad absoluta.
          </p>

          <h2>6. Enlaces a Otros Sitios</h2>
          <p>
            Nuestro sitio web puede contener enlaces a otros sitios que no son operados por nosotros. Si haces clic en un 
            enlace de terceros, serás dirigido al sitio de ese tercero. Te recomendamos encarecidamente que revises la 
            Política de Privacidad de cada sitio que visites.
          </p>
          <p>
            No tenemos control ni asumimos responsabilidad alguna por el contenido, políticas de privacidad o prácticas 
            de sitios o servicios de terceros.
          </p>

          <h2>7. Cambios a Esta Política de Privacidad</h2>
          <p>
            Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando 
            la nueva Política de Privacidad en esta página.
          </p>
          <p>
            Se te aconseja revisar esta Política de Privacidad periódicamente para cualquier cambio. Los cambios a esta 
            Política de Privacidad son efectivos cuando se publican en esta página.
          </p>

          <h2>8. Contacto</h2>
          <p>
            Si tienes alguna pregunta sobre esta Política de Privacidad, por favor <Link href="/contact" className="text-secondary hover:underline">contáctanos</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;