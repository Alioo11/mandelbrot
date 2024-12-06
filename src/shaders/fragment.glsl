precision mediump float;
precision highp float;

const float MAX_ITER = 300.0;

uniform float time;
uniform vec2 resolution;

vec4 hsvToRgba(float hue, float saturation, float value) {
    // Normalize hue to [0, 1] range
    hue = mod(hue, 1.0);

    // Calculate the chroma, intermediate value, and X component
    float chroma = value * saturation;
    float hPrime = hue * 6.0;
    float x = chroma * (1.0 - abs(mod(hPrime, 2.0) - 1.0));

    float r = 0.0;
    float g = 0.0;
    float b = 0.0;

    if(0.0 <= hPrime && hPrime < 1.0) {
        r = chroma;
        g = x;
        b = 0.0;
    } else if(1.0 <= hPrime && hPrime < 2.0) {
        r = x;
        g = chroma;
        b = 0.0;
    } else if(2.0 <= hPrime && hPrime < 3.0) {
        r = 0.0;
        g = chroma;
        b = x;
    } else if(3.0 <= hPrime && hPrime < 4.0) {
        r = 0.0;
        g = x;
        b = chroma;
    } else if(4.0 <= hPrime && hPrime < 5.0) {
        r = x;
        g = 0.0;
        b = chroma;
    } else if(5.0 <= hPrime && hPrime < 6.0) {
        r = chroma;
        g = 0.0;
        b = x;
    }

    // Add the lightness component
    float m = value - chroma;
    r += m;
    g += m;
    b += m;

    return vec4(r, g, b, 1.0); // Return RGBA with alpha set to 1.0
}

// double f = 2.0;

float mandelbrot(vec2 _uv) {
    vec2 uv = _uv * 100.0;
    vec2 c = 100.0 * uv - vec2(1.0, 1.0);
    // vec2 c = 0.00001 * uv - vec2(-0.269001, -0.005003);

    vec2 z = vec2(0.0);

    float t = time / 900.0;
    c = c / pow(t, 6.0) - vec2(0.65, 0.45);

    for(float i = 0.0; i < MAX_ITER; i += 1.0) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        float dot_product = z.x * z.x + z.y * z.y;
        if(dot_product > 40.0)
            return (i / MAX_ITER) * (i / MAX_ITER);
    }

    return 1.0;
}

float mandelbrot2(vec2 _uv) {
    vec2 uv = _uv;
    vec2 c = 0.00001 * uv - vec2(-0.269001, -0.005003); // Ensure uv precision
    // vec2 c = 14.0 * uv - vec2(-2.0, -2.0);
    vec2 z = vec2(0.0);

    for(float i = 0.0; i < MAX_ITER; i += 0.5) { // Use integer increment
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if(dot(z, z) > 4.0)
            return i / MAX_ITER; // Use built-in dot function
    }

    return 1.0; // Ensure proper bounds for non-escaping points
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.xy;
    vec3 col = vec3(0.0);
    float m = mandelbrot(uv);
    col.xy += m;
    vec4 color = hsvToRgba(col.x, col.y, 1.0);
    gl_FragColor = color;
}
