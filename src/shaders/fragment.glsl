precision mediump float;
precision highp float;

uniform sampler2D u_texture;

uniform vec2 resolution;
uniform vec2 center;
uniform float zoom;
uniform float time;

float ut = mod(time / 40.0, 1000.0);
const float MAX_ITERATIONS = 200.0;


vec4 gradientColor(float gradient) {
    float hue = gradient * 360.0;
    float saturation = 0.7;
    float value = 0.9;

    float h = hue / 90.0;
    int i = int(floor(h));
    float f = h - float(i);
    float p = value * (1.0 - saturation);
    float q = value * (1.0 - saturation * f);
    float t = value * (1.0 - saturation * (1.0 - f));

    if (i == 0) {
        return vec4(value, gradient, p, 1.0);
    } else if (i == 1) {
        return vec4(q, value, p, 1.0);
    } else if (i == 2) {
        return vec4(p, value, gradient, 1.0);
    } else if (i == 3) {
        return vec4(p, q, value, 1.0);
    } else if (i == 4) {
        return vec4(gradient, p, value, 1.0);
    } else {
        return vec4(value, p, q, 1.0);
    }
}

float mapValue(float x) {
    float x1 = 0.0005;
    float y1 = 200.0;
    float x2 = 3.0;
    float y2 = 20.0;

    // Calculate the slope (A) and intercept (B)
    float A = (y2 - y1) / (log(x2) - log(x1));
    float B = y1 - A * log(x1);

    // Apply the mapping
    return A * log(x) + B;
}

float mandelbrot(vec2 uv) {
    vec2 c = zoom * uv - center;
    vec2 z = vec2(0.0);

    float overflow = 0.0;
    float iter = 0.0;
    for(float i = 0.0; i < MAX_ITERATIONS; i++) {
        if(i > mapValue(zoom)) break;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if(dot(z, z) > 4.0) return 1.0 -  sqrt(i / MAX_ITERATIONS);
            
        iter++;
    }

    return 0.2;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    vec3 color = vec3(0.0);
    float mandelbrotResult = mandelbrot(uv);
    color += vec3(gradientColor(mandelbrotResult));
    gl_FragColor = vec4(color, 1.0);
}