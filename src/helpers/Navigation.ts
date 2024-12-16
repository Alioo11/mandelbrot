import { vec2 } from "gl-matrix";

const ZOOM_LIMIT = [0.00005, 3];
const CENTER_BOUND = [-2, 2];

class NavigationHelper {
  private _canvas: HTMLCanvasElement;
  private _zoom: number = 1;
  private _center: vec2 = [0, 0];
  private _prevCenter: vec2 = [0, 0];
  private _isPanning = false;

  get center() {
    return this._center;
  }
  get zoom() {
    return this._zoom;
  }


  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._registerPanningEvent();
    this._registerWheelEvents();
    this._registerMouseMoveEvents();
  }

  private _registerWheelEvents() {
    this._canvas.addEventListener("wheel", (e) => {
      const zoomFactor = Math.exp(e.deltaY * 0.003);
      const newZoom = this._zoom * zoomFactor;
      const [min_zoom, max_zoom] = ZOOM_LIMIT;

      if (newZoom > max_zoom) return (this._zoom = max_zoom);
      if (newZoom < min_zoom) return (this._zoom = min_zoom);

      this._zoom = newZoom;
    });
  }

  private _registerPanningEvent() {
    window.addEventListener("mousedown", (e) => {
      this._isPanning = true;
      this._prevCenter = [e.clientX, e.clientY];
    });

    window.addEventListener("mouseup", () => (this._isPanning = false));
  }

  private _registerMouseMoveEvents() {
    this._canvas.addEventListener("mousemove", (e) => {
      if (!this._isPanning) return;
      const newX = e.clientX;
      const newY = e.clientY;

      const DX = newX - this._prevCenter[0];
      const DY = newY - this._prevCenter[1];

      const XC = (DX / 1000) * this._zoom;
      const YC = (DY / 1000) * this._zoom;

      let newCenter:vec2 = [(this._center[0] += XC), (this._center[1] -= YC)];

      const [newCX, newCY] = newCenter;
      const [lowerBound, highBound] = CENTER_BOUND;

      if (newCX < lowerBound) newCenter[0] = lowerBound;
      if (newCX > highBound) newCenter[0] = highBound;

      if (newCY < lowerBound) newCenter[1] = lowerBound;
      if (newCY > highBound) newCenter[1] = highBound;

      this._center = newCenter;

      this._prevCenter = [newX, newY];
    });
  }
}


export default NavigationHelper;