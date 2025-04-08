const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function generateFavicons() {
  try {
    // Leer el SVG
    const svgPath = path.join(__dirname, 'client/public/favicon.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    // Crear un Data URL del SVG
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(
      svgContent
    ).toString('base64')}`;

    // Tamaños para generar
    const sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'apple-touch-icon.png', size: 180 },
    ];

    // Generar cada tamaño
    for (const { name, size } of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Cargar la imagen SVG
      const img = await loadImage(svgDataUrl);
      ctx.drawImage(img, 0, 0, size, size);

      // Guardar como PNG
      const outputPath = path.join(__dirname, 'client/public', name);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on('finish', () => {
        console.log(`✅ ${name} generado`);
      });
    }

    // Generar favicon.ico (16x16)
    const icoCanvas = createCanvas(16, 16);
    const icoCtx = icoCanvas.getContext('2d');
    const icoImg = await loadImage(svgDataUrl);
    icoCtx.drawImage(icoImg, 0, 0, 16, 16);

    // Para favicon.ico, convertimos primero a PNG y luego usamos otra librería
    // para convertir a ICO, pero como no tenemos acceso a esa librería,
    // simplemente guardaremos una copia del PNG de 16x16
    const icoOutputPath = path.join(__dirname, 'client/public/favicon.ico');
    const icoOut = fs.createWriteStream(icoOutputPath);
    const icoStream = icoCanvas.createPNGStream();
    icoStream.pipe(icoOut);

    icoOut.on('finish', () => {
      console.log('✅ favicon.ico generado');
    });

    console.log('Proceso de generación de favicons completado.');
  } catch (error) {
    console.error('Error generando favicons:', error);
  }
}

generateFavicons();
