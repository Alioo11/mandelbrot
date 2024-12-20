//@ts-expect-error
import fragmentShaderSrc from "@shaders/fragment.glsl";
//@ts-expect-error
import vertexShaderSrc from "@shaders/vertex.glsl";
import createCanvas from "@utils/initCanvas";
import { createProgram } from "@utils/shaderLoader";
import NavigationHelper from "./helpers/Navigation";
import $ from "jquery";

const viewScreenCoordinates = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

const WIDTH = window.innerWidth - 10;
const HEIGHT = window.innerHeight - 10;

$(document).ready(function () {
  const githubURL = "https://github.com/Alioo11/mandelbrot"; // Replace with your GitHub URL

  // Create the GitHub icon element
  const githubIcon = $("<a>", {
    href: githubURL,
    target: "_blank",
    id: "github-icon",
  })
    .css({ position: "absolute", top: "10px", right: "10px" })
    .append(
      $("<img>", {
        src: "https://cdn.icon-icons.com/icons2/2368/PNG/512/github_logo_icon_143772.png",
        alt: "GitHub",
        width: "50",
        height: "50",
      })
    );

  // Append it to the body
  $("body").append(githubIcon);
});

const main = async () => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  document.body.style.backgroundColor = "black";
  document.body.style.margin = "5px";
  document.body.style.display = "flex";
  document.body.style.justifyContent = "center";
  document.body.style.alignItems = "center";
  const gl = canvas.getContext("webgl");

  if (!gl) throw new Error("");

  const program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
  gl.useProgram(program);

  const navigation = new NavigationHelper(canvas);

  const nowForNow = new Date().getTime();

  // const framebuffer = gl.createFramebuffer();
  // gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  // const texture = gl.createTexture();
  // gl.bindTexture(gl.TEXTURE_2D, texture);
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);


  function render() {
    if (!gl) throw new Error();
    navigation.update();

    const deltaTime = new Date().getTime() - nowForNow;

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);


    // gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    // gl.viewport(0, 0, canvas.width, canvas.height);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const resolutionUniform = gl.getUniformLocation(program, "resolution");
    const centerUniform = gl.getUniformLocation(program, "center");
    const zoomUniform = gl.getUniformLocation(program, "zoom");
    const timeUniform = gl.getUniformLocation(program, "time");

    gl.uniform2f(resolutionUniform, WIDTH, HEIGHT);
    gl.uniform2f(centerUniform, navigation.center[0], navigation.center[1]);
    gl.uniform1f(zoomUniform, navigation.zoom);
    gl.uniform1f(timeUniform, deltaTime);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, viewScreenCoordinates, gl.STATIC_DRAW);

    gl.viewport(0, 0, WIDTH, HEIGHT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  render();
};

main();
