const sharp = require('sharp');
console.log('Sharp loaded successfully');
sharp({
  create: {
    width: 300,
    height: 200,
    channels: 4,
    background: { r: 255, g: 0, b: 0, alpha: 0.5 }
  }
})
.png()
.toBuffer()
.then(data => {
  console.log('Successfully processed a dummy image with Sharp. Buffer size:', data.length);
  process.exit(0);
})
.catch(err => {
  console.error('Sharp processing failed:', err);
  process.exit(1);
});
