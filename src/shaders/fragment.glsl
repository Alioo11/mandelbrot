precision mediump float;
precision highp float;

uniform vec2 resolution;
uniform vec2 center;
uniform float zoom;
uniform float time;

float ut = mod(time / 100.0, 500.0);
const float MAX_ITERATIONS = 500.0;

float mandelbrot(vec2 uv) {
    vec2 c = zoom * uv - center;
    vec2 z = vec2(0.0);

    float iter = 0.0;
    for(float i = 0.0; i < MAX_ITERATIONS; i++) {
        if(i > ut) break;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if(dot(z, z) > 4.0)
            return 1.0 - (i / MAX_ITERATIONS);
        iter++;
    }
    return 0.2;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    vec3 color = vec3(0.0);
    color += mandelbrot(uv);
    gl_FragColor = vec4(color, 1.0);
}