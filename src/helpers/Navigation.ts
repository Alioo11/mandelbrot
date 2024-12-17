import { vec2 } from "gl-matrix";
import { easeBack, easeBackIn, easeElastic, easePoly } from "d3-ease";

const ZOOM_LIMIT = [0.00005, 3];
const CENTER_BOUND = [-2, 2];

class NavigationHelper {
  private _canvas: HTMLCanvasElement;
  private _zoom: number = 3;
  private _center: vec2 = [0, 0];
  private _prevCenter: vec2 = [0, 0];
  private _isPanning = false;

  private _navigationStartStamp: number | null = null;
  private _navigationDuration = 1000;
  private _navigationTarget: vec2 | null = null;
  private _navigationSource: vec2 | null = null;

  private _zoomTarget: number | null = null;
  private _zoomSource: number | null = null;
  private _callback: Function | null = null;

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
      this._discardNavigation();
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
      this._discardNavigation();
      const newX = e.clientX;
      const newY = e.clientY;

      const DX = newX - this._prevCenter[0];
      const DY = newY - this._prevCenter[1];

      const XC = (DX / 1000) * this._zoom;
      const YC = (DY / 1000) * this._zoom;

      let newCenter: vec2 = [(this._center[0] += XC), (this._center[1] -= YC)];

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

  update() {
    if (!this._navigationStartStamp) return;
    const passedTime = new Date().getTime() - this._navigationStartStamp;
    if (
      passedTime > this._navigationDuration ||
      !this._navigationTarget ||
      !this._navigationSource ||
      !this._zoomSource ||
      !this._zoomTarget
    )
      return this._discardNavigation();
    const normalizedProgress = passedTime / this._navigationDuration;

    const cubic = easePoly.exponent(3);
    const easingResult = cubic(normalizedProgress);

    const newX = (this._navigationTarget[0] - this._navigationSource[0]) * easingResult;
    const newY = (this._navigationTarget[1] - this._navigationSource[1]) * easingResult;
    const newZ = (this._zoomTarget - this._zoomSource) * easingResult;

    this._center[0] = this._navigationSource[0] + newX;
    this._center[1] = this._navigationSource[1] + newY;
    this._zoom = this._zoomSource + newZ;
  }

  private _discardNavigation() {
    this._navigationStartStamp = null;
    this._navigationDuration = 1000;
    this._navigationTarget = null;
    this._navigationSource = null;
    this._zoomTarget = null;
    this._zoomSource = null;
    if(this._callback){ 
      this._callback()
      this._callback = null;
    }
  }

  navigateTo(x: number, y: number, zoom: number, duration: number = 1000, cb?: Function) {
    this._navigationStartStamp = new Date().getTime();
    this._navigationTarget = [x, y];
    this._zoomTarget = zoom;
    this._zoomSource = this._zoom;
    this._navigationSource = [this._center[0], this._center[1]];
    this._navigationDuration = duration;
    if(cb) this._callback = cb;
  }
}


export default NavigationHelper;