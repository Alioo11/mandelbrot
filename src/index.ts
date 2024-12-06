//@ts-ignore
import fragmentShaderSrc from "/shaders/fragment.glsl";
//@ts-ignore
import vertexShaderSrc from "/shaders/vertex.glsl";
import createCanvas from "@utils/initCanvas";
import { createProgram } from "@utils/shaderLoader";

const viewScreenCoordinates = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const main = () => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  document.body.style.backgroundColor = "black";
  document.body.style.margin = "0px";
  const gl = canvas.getContext("webgl");

  if (!gl) throw new Error("");

  const program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
  gl.useProgram(program);

  // Set uniforms and attributes
  const resolutionUniform = gl.getUniformLocation(program, "u_resolution");
  const centerUniform = gl.getUniformLocation(program, "u_center");
  const zoomUniform = gl.getUniformLocation(program, "u_zoom");

  gl.uniform2f(resolutionUniform, WIDTH, HEIGHT);
  gl.uniform2f(centerUniform, -0.5, 0.0);
  gl.uniform1f(zoomUniform, 30.0);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, viewScreenCoordinates, gl.STATIC_DRAW);

  // Render
  function render() {
    if (!gl) throw new Error();
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, WIDTH, HEIGHT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  render();
};

export default main;
