const state = {
  drawFacePull: {
    prevFace: null
  }
};

function pointIsWithinShape(p, shp) {
  const x = p[0];
  const y = p[1];

  let inside = false;
  for (let i = 0, j = shp.length - 1; i < shp.length; j = i++) {
    const xi = shp[i][0];
    const yi = shp[i][1];
    const xj = shp[j][0];
    const yj = shp[j][1];

    const intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}


function imgDataToImg(imgData, height, width) {
  const img = new Image();
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  c.getContext('2d').putImageData(imgData, 0, 0);

  return new Promise(resolve => {
    img.onload = () => {
      resolve(img);
    }
    img.src = c.toDataURL();
  });
  
}

export function drawImage({image, ctx, height, width }) {
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = (data[i * 3 + 0] + 1);
    imageData.data[j + 1] = (data[i * 3 + 1] + 1);
    imageData.data[j + 2] = (data[i * 3 + 2] + 1);
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export function drawEmoji({ ctx, image, height, width, emoji, faces }) {
  emoji = emoji || '😜';
  faces = faces || [];
  drawImage({ ctx, image, height, width });
  faces.forEach(face => {
    const { bottomRight, topLeft } = face.boundingBox;
    const xDiff = bottomRight[0][0] - topLeft[0][0];
    const yDiff = bottomRight[0][1] - topLeft[0][1];
    const max = Math.max(xDiff, yDiff);
    
    ctx.font = `${max}px serif`
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, topLeft[0][0] + xDiff / 2, topLeft[0][1] + yDiff / 2);
  });
}


export async function drawFacePull({ ctx, image, height, width, faces, controls }) {

  if (!controls.isPressedDown) {
    drawImage({ ctx, image, height, width });
    return;
  }
  const imageData = new ImageData(width, height);
  const face = faces[0];

  const topLeft = face.boundingBox.topLeft[0].map(Math.floor);
  const bottomRight = face.boundingBox.bottomRight[0].map(Math.floor);
  const noseTip = face.annotations.noseTip[0].map(Math.floor);
  const silhouette = face.annotations.silhouette;
  const silhouetteHeight = Math.floor(bottomRight[1] - topLeft[1]);
  const silhouetteWidth = Math.floor(bottomRight[0] - topLeft[0]);
  const silhouetteBbox = [
    topLeft.map(p => Math.floor(p)),
    [
      Math.floor(topLeft[0]) + silhouetteWidth,
      Math.floor(topLeft[1])
    ],
    bottomRight.map(p => Math.floor(p)),
    [
      Math.floor(bottomRight[0]) - silhouetteWidth,
      Math.floor(bottomRight[1]),
    ]
  ]; 
 
  const faceData = new ImageData(silhouetteWidth, silhouetteHeight);
  const data = image.dataSync();
  let imgIdx = 0;

  for (let i = 0; i < height * width; ++i) {
    const x = i % width;
    const y = Math.floor(i / width);

    imageData.data[i * 4 + 0] = (data[i * 3 + 0] + 1);
    imageData.data[i * 4 + 1] = (data[i * 3 + 1] + 1);
    imageData.data[i * 4 + 2] = (data[i * 3 + 2] + 1);
    imageData.data[i * 4 + 3] = 255;

    if (pointIsWithinShape([x, y], silhouetteBbox)) {

      faceData.data[imgIdx * 4 + 0] = (data[i * 3 + 0] + 1);
      faceData.data[imgIdx * 4 + 1] = (data[i * 3 + 1] + 1);
      faceData.data[imgIdx * 4 + 2] = (data[i * 3 + 2] + 1);
      faceData.data[imgIdx * 4 + 3] = 0;

      if (pointIsWithinShape([x, y], silhouette)) {
        faceData.data[imgIdx * 4 + 3] = 255;
        imageData.data[i * 4 + 0] = 0;
        imageData.data[i * 4 + 1] = 0;
        imageData.data[i * 4 + 2] = 0;
        imageData.data[i * 4 + 3] = 255;
      }

      imgIdx++;
    }
  }

  ctx.clearRect(0, 0, width, height);

  ctx.putImageData(imageData, 0, 0);

  const offset = controls.getOffset();

  ctx.strokeStyle = '#FF0000';
  silhouette.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y, x, y + Math.abs(offset.y), x + offset.x, y + offset.y);
    ctx.stroke();
  });

  if (state.drawFacePull.prevFace) {
    ctx.drawImage(state.drawFacePull.prevFace, topLeft[0] + offset.x, topLeft[1] + offset.y);
  }

  imgDataToImg(faceData, silhouetteHeight, silhouetteWidth).then(img => {
    state.drawFacePull.prevFace = img;
    ctx.drawImage(img, topLeft[0] + offset.x, topLeft[1] + offset.y);
  });

}
