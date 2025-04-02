import { useEffect } from 'react';
import { Link } from 'wouter';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-clash font-bold text-4xl md:text-5xl text-primary mb-8">Términos de Servicio</h1>
        
        <p className="text-text/70 mb-8">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-lg max-w-none">
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar este sitio web, aceptas estar sujeto a estos Términos de Servicio, todas las leyes 
            y regulaciones aplicables, y aceptas que eres responsable del cumplimiento de cualquier ley local aplicable. 
            Si no estás de acuerdo con alguno de estos términos, tienes prohibido usar o acceder a este sitio. Los 
            materiales contenidos en este sitio web están protegidos por las leyes de derechos de autor y marcas comerciales aplicables.
          </p>

          <h2>2. Licencia de Uso</h2>
          <p>
            Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio 
            web de Adrián Aguirre para visualización personal, no comercial y transitoria únicamente. Esta es la concesión de 
            una licencia, no una transferencia de título, y bajo esta licencia no puedes:
          </p>
          <ul>
            <li>Modificar o copiar los materiales;</li>
            <li>Usar los materiales para cualquier propósito comercial o para cualquier exhibición pública (comercial o no comercial);</li>
            <li>Intentar descompilar o aplicar ingeniería inversa a cualquier software contenido en el sitio web de Adrián Aguirre;</li>
            <li>Eliminar cualquier derecho de autor u otras notaciones de propiedad de los materiales; o</li>
            <li>Transferir los materiales a otra persona o "duplicar" los materiales en cualquier otro servidor.</li>
          </ul>
          <p>
            Esta licencia terminará automáticamente si violas cualquiera de estas restricciones y puede ser terminada por 
            Adrián Aguirre en cualquier momento. Al terminar tu visualización de estos materiales o al finalizar esta licencia, 
            debes destruir cualquier material descargado en tu posesión, ya sea en formato electrónico o impreso.
          </p>

          <h2>3. Descargo de Responsabilidad</h2>
          <p>
            Los materiales en el sitio web de Adrián Aguirre se proporcionan "tal cual". Adrián Aguirre no ofrece garantías, 
            expresas o implícitas, y por la presente rechaza y niega todas las demás garantías, incluyendo, sin limitación, 
            las garantías implícitas o las condiciones de comerciabilidad, idoneidad para un propósito particular, o no 
            infracción de la propiedad intelectual u otra violación de derechos.
          </p>
          <p>
            Además, Adrián Aguirre no garantiza ni hace ninguna representación con respecto a la precisión, los resultados 
            probables o la confiabilidad del uso de los materiales en su sitio web o de otra manera relacionados con tales 
            materiales o en cualquier sitio vinculado a este sitio.
          </p>

          <h2>4. Limitaciones</h2>
          <p>
            En ningún caso Adrián Aguirre o sus proveedores serán responsables por cualquier daño (incluyendo, sin limitación, 
            daños por pérdida de datos o beneficios, o debido a la interrupción del negocio) que surjan del uso o incapacidad 
            para usar los materiales en el sitio web de Adrián Aguirre, incluso si Adrián Aguirre o un representante autorizado 
            de Adrián Aguirre ha sido notificado oralmente o por escrito de la posibilidad de tales daños. Dado que algunas 
            jurisdicciones no permiten limitaciones en las garantías implícitas, o limitaciones de responsabilidad por daños 
            consecuentes o incidentales, estas limitaciones pueden no aplicarse a ti.
          </p>

          <h2>5. Revisiones y Erratas</h2>
          <p>
            Los materiales que aparecen en el sitio web de Adrián Aguirre podrían incluir errores técnicos, tipográficos o 
            fotográficos. Adrián Aguirre no garantiza que cualquiera de los materiales en su sitio web sea preciso, completo 
            o actual. Adrián Aguirre puede realizar cambios a los materiales contenidos en su sitio web en cualquier momento 
            sin previo aviso. Sin embargo, Adrián Aguirre no se compromete a actualizar los materiales.
          </p>

          <h2>6. Enlaces</h2>
          <p>
            Adrián Aguirre no ha revisado todos los sitios vinculados a su sitio web y no es responsable por el contenido de 
            ningún sitio vinculado. La inclusión de cualquier enlace no implica respaldo por parte de Adrián Aguirre del sitio. 
            El uso de cualquier sitio web vinculado es bajo el propio riesgo del usuario.
          </p>

          <h2>7. Modificaciones a los Términos de Servicio</h2>
          <p>
            Adrián Aguirre puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. 
            Al utilizar este sitio web, aceptas estar sujeto a la versión actual de estos Términos y Condiciones de Uso.
          </p>

          <h2>8. Ley Aplicable</h2>
          <p>
            Cualquier reclamación relacionada con el sitio web de Adrián Aguirre se regirá por las leyes de España sin 
            consideración de sus disposiciones sobre conflicto de leyes.
          </p>

          <h2>9. Contacto</h2>
          <p>
            Si tienes alguna pregunta sobre estos Términos de Servicio, por favor <Link href="/contact" className="text-secondary hover:underline">contáctanos</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;