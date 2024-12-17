import { vec2 } from "gl-matrix";
import { easePoly } from "d3-ease";
import debounce from "@utils/debounce";
import throttle from "@utils/throttel";

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

  private _prevTouchDistance: null | number = null;

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

    let startY = 0;

    window.addEventListener(
      "touchstart",
      (event) => {
        startY = event.touches[0].clientY;
      },
      { passive: false }
    );

    window.addEventListener(
      "touchmove",
      (event) => {
        const currentY = event.touches[0].clientY;

        // Prevent pull-to-refresh if the user is swiping down at the top of the page
        if (window.scrollY === 0 && currentY > startY) {
          event.preventDefault();
        }
      },
      { passive: false }
    );
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

    window.addEventListener("touchstart", (e) => {
      const [firstTouch, secondTouch] = e.touches;
      this._isPanning = true;
      this._prevCenter = [firstTouch.clientX, firstTouch.clientY];

      if (firstTouch && secondTouch) {
        const { clientX: firstTouchX, clientY: firstTouchY } = firstTouch;
        const { clientX: secondTouchX, clientY: secondTouchY } = secondTouch;

        const DX = secondTouchX - firstTouchX;
        const DY = secondTouchY - firstTouchY;
        const dist = Math.sqrt(DX ** 2 + DY ** 2);
        this._prevTouchDistance = dist;
      }
    });

    window.addEventListener("mouseup", () => (this._isPanning = false));
    window.addEventListener("touchend", () => {
      this._isPanning = false;
      this._prevTouchDistance = null;
    });
  }

  private _moveEvent = (x: number, y: number) => {
    const newX = x;
    const newY = y;

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
  };

  private _touchZoom = (firstTouch:Touch, secondTouch:Touch , prevTouchDistance:number) =>{
    const { clientX: firstTouchX, clientY: firstTouchY } = firstTouch;
    const { clientX: secondTouchX, clientY: secondTouchY } = secondTouch;

    const DX = secondTouchX - firstTouchX;
    const DY = secondTouchY - firstTouchY;
    const dist = Math.sqrt(DX ** 2 + DY ** 2);

    const deltaY = (prevTouchDistance - dist);

    const zoomFactor = Math.exp(deltaY * 0.001);
    const newZoom = this._zoom * zoomFactor;
    const [min_zoom, max_zoom] = ZOOM_LIMIT;

    if (newZoom > max_zoom) return (this._zoom = max_zoom);
    if (newZoom < min_zoom) return (this._zoom = min_zoom);

    this._zoom = newZoom;
  }

  private _registerMouseMoveEvents() {
    this._canvas.addEventListener("touchmove", (e) => {
      if (!this._isPanning) return;
      this._discardNavigation();
      const [firstTouch, secondTouch] = e.touches;

      if (firstTouch && secondTouch && this._prevTouchDistance) {

        this._touchZoom(firstTouch , secondTouch, this._prevTouchDistance)
      } else {
        this._moveEvent(firstTouch.clientX, firstTouch.clientY);
      }
    });

    this._canvas.addEventListener("mousemove", (e) => {
      if (!this._isPanning) return;
      this._discardNavigation();
      this._moveEvent(e.clientX, e.clientY);
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
    if (this._callback) {
      this._callback();
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
    if (cb) this._callback = cb;
  }
}

export default NavigationHelper;
