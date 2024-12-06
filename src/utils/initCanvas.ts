const createCanvas = (width: number, height: number, id?: string) => {
  if (!document) throw new Error("");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.id = id ?? (Math.random() * 10000000).toFixed(0);

  document.body.appendChild(canvas);

  return canvas;
};

export default createCanvas;
