// sketch4 - blood.js 改进版（实例模式）
new p5((p) => {
  let scrollingImg;
  let fruitImg;
  let bgLayer;

  const IMG_CONFIG = {
    url: 'doujiao.png',
    width: 1200,      
    height: 410,     
    speed: 2,         
    row1_y: -30,      
    row2_y: 340       
  };

  const FRUIT_CONFIG = {
    url: '909.png',
    gap: 210,
    minSize: 100,
    maxSize: 250,
    yVariance: 30
  };

  const MOSAIC_SIZE = 13;

  p.preload = function() {
    try {
      scrollingImg = p.loadImage(IMG_CONFIG.url, function() {}, function() {
        console.warn("Failed to load scrolling image");
        scrollingImg = null;
      });
      fruitImg = p.loadImage(FRUIT_CONFIG.url, function() {}, function() {
        console.warn("Failed to load fruit image");
        fruitImg = null;
      });
    } catch(e) {
      console.warn("Preload error:", e);
    }
  };

  p.setup = function() {
    let container = document.getElementById('p5-4');
    let w = container.offsetWidth || 500;
    let h = container.offsetHeight || 400;
    p.createCanvas(w, h);
  
    if (scrollingImg) {
      scrollingImg.resize(IMG_CONFIG.width, IMG_CONFIG.height);
    }
  
    bgLayer = p.createGraphics(p.width, p.height);
    drawSolidTexturedBackground(bgLayer);
  };

  p.draw = function() {
    if (!bgLayer) return;
  
    p.imageMode(p.CORNER);
    p.image(bgLayer, 0, 0);
  
    if (scrollingImg) {
      drawScrollingRow(IMG_CONFIG.row1_y, 1);
      drawScrollingRow(IMG_CONFIG.row2_y, -1);
    }
  
    applyMosaic(MOSAIC_SIZE);
  };

  function drawScrollingRow(yPos, direction) {
    if (!scrollingImg || !fruitImg) return;

    let imgW = IMG_CONFIG.width;
    let imgH = IMG_CONFIG.height;
  
    let offset = (p.frameCount * IMG_CONFIG.speed * direction) % imgW;
    let totalImages = p.ceil(p.width / imgW) + 2;
  
    let fruitsPerImage = p.floor(imgW / FRUIT_CONFIG.gap);

    for (let i = -1; i < totalImages; i++) {
      let x = (i * imgW) + offset;
    
      if (direction === -1) {
         x = (i * imgW) + offset + imgW;
      }
    
      p.imageMode(p.CORNER);
      p.image(scrollingImg, x, yPos);
    
      for (let j = 0; j < fruitsPerImage; j++) {
        p.randomSeed(i * 10000 + j * 100 + direction * 500);
      
        let localX = j * FRUIT_CONFIG.gap + p.random(-10, 10);
        let fruitX = x + localX;
      
        let rowCenterY = yPos + (imgH / 2);
        let fruitY = rowCenterY + p.random(-FRUIT_CONFIG.yVariance, FRUIT_CONFIG.yVariance);
      
        let size = p.random(FRUIT_CONFIG.minSize, FRUIT_CONFIG.maxSize);
        let rot = p.random(p.TWO_PI);
      
        p.push();
        p.translate(fruitX, fruitY);
        p.rotate(rot);
        p.imageMode(p.CENTER);
        p.image(fruitImg, 0, 0, size, size);
        p.pop();
      }
    }
  }

  function drawSolidTexturedBackground(pg) {
    pg.noStroke();
    pg.fill(35, 0, 0); 
    pg.rect(0, 0, p.width, p.height);
  }

  function applyMosaic(pixelSize) {
    p.loadPixels();
  
    p.noStroke();
  
    for (let y = 0; y < p.height; y += pixelSize) {
      for (let x = 0; x < p.width; x += pixelSize) {
        let index = (y * p.width + x) * 4;
      
        let r = p.pixels[index];
        let g = p.pixels[index + 1];
        let b = p.pixels[index + 2];
      
        p.fill(r, g, b);
        p.rect(x, y, pixelSize, pixelSize);
      }
    }
  }

  p.windowResized = function() {
    let container = document.getElementById('p5-4');
    let w = container ? container.offsetWidth || 500 : 500;
    let h = container ? container.offsetHeight || 400 : 400;
    p.resizeCanvas(w, h);
    bgLayer = p.createGraphics(p.width, p.height);
    drawSolidTexturedBackground(bgLayer);
  };
}, 'p5-4');