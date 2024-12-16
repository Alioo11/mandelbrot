//@ts-ignore
import fragmentShaderSrc from "@shaders/fragment.glsl";
//@ts-ignore
import vertexShaderSrc from "@shaders/vertex.glsl";
import createCanvas from "@utils/initCanvas";
import { createProgram } from "@utils/shaderLoader";

const ZOOM_LIMIT = [0.1 , 10];

const viewScreenCoordinates = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

const WIDTH = 1920;
const HEIGHT = 1080;

const main = () => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  document.body.style.backgroundColor = "black";
  document.body.style.margin = "0px";
  const gl = canvas.getContext("webgl");

  if (!gl) throw new Error("");

  const program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
  gl.useProgram(program);

  let zoom = 1;
  let center = [0, 0];
  let prevCenter = [0, 0];
  let isPanning = false;

  window.addEventListener("mousedown", (e) => {
    isPanning = true;
    prevCenter = [e.clientX, e.clientY];
  });
  window.addEventListener("mouseup", () => (isPanning = false));
  canvas.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    const newX = e.clientX;
    const newY = e.clientY;

    const DX = newX - prevCenter[0];
    const DY = newY - prevCenter[1];

    const XC = DX / 1000 * zoom;
    const YC = DY / 1000 * zoom;

    center[0] += XC;
    center[1] -= YC;

    prevCenter = [newX, newY];
  });

  canvas.addEventListener('wheel', (e)=>{
    const zoomFactor = Math.exp(e.deltaY * 0.003);
    const newZoom = zoom * zoomFactor;

    // const [min_zoom , max_zoom] = ZOOM_LIMIT;
    // if (newZoom > max_zoom || newZoom < min_zoom) return;
    zoom = newZoom;
  });

  const nowForNow = new Date().getTime();

  function render() {
    if (!gl) throw new Error();
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionUniform = gl.getUniformLocation(program, "resolution");
    const centerUniform = gl.getUniformLocation(program, "center");
    const zoomUniform = gl.getUniformLocation(program, "zoom");
    const timeUniform = gl.getUniformLocation(program, "time");

    gl.uniform2f(resolutionUniform, WIDTH, HEIGHT);
    gl.uniform2f(centerUniform, center[0], center[1]);
    gl.uniform1f(zoomUniform, zoom);
    gl.uniform1f(timeUniform, new Date().getTime() - nowForNow);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, viewScreenCoordinates, gl.STATIC_DRAW);

    gl.viewport(0, 0, WIDTH, HEIGHT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  render();
};

main();
