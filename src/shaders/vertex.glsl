attribute vec2 position;

varying vec2 v_uv;

void main() {
  v_uv = position;
  gl_Position = vec4(position, 0.0, 1.0);
}