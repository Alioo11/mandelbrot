import $ from "jquery";

type DevPanelInputTypes = "number" | "text" | "range" | "bool" | "action";

const ROOT_ID = "dev-kit-root";

class DevPanelInput {
  private readonly _element: JQuery<HTMLElement>;
  constructor(element: JQuery<HTMLElement>) {
    this._element = element;
  }

  action(name: string, cb: Function) {
    const root = $("<div>")
      .addClass("border-bottom border-secondary d-flex justify-content-between align-items-center p-1")
      .css("height", "30px")
      .appendTo(this._element);
    $("<p/>").addClass("m-0").text(name).css("font-size", "13px").appendTo(root);
    const btn = $("<button/>")
      .addClass("btn btn-secondary btn-sm px-4 py-0")
      .css("max-height", "30px")
      .text("click")
      .appendTo(root);
    btn.on("click", () => cb());
    return this;
  }

  bool(name: string, cb: (event: boolean) => void, initialTrue?: boolean) {
    const root = $("<div>")
      .addClass("border-bottom border-secondary d-flex justify-content-between align-items-center p-1")
      .css("height", "30px")
      .appendTo(this._element);
    $("<p/>").addClass("m-0").text(name).css("font-size", "13px").appendTo(root);
    const btn = $("<input/>")
      .attr("type", "checkbox")
      .attr("checked", Boolean(initialTrue) ? "true" : null)
      .attr("role", "switch")
      .addClass("form-check-input")
      .appendTo(root);
    //@ts-ignore
    btn.on("click", (e) => cb(e.target.checked));
    return this;
  }

  range(name: string, cb: (event: number) => void, min: number = 0, max: number = 100, initialValue: number = 50) {
    const root = $("<div>")
      .addClass("border-bottom border-secondary d-flex justify-content-between align-items-center p-1")
      .css("height", "30px")
      .appendTo(this._element);
    $("<p/>").addClass("m-0").text(name).css("font-size", "13px").css("min-width", "80px").appendTo(root);
    const rangeInput = $("<input/>")
      .attr("type", "range")
      .attr("min", min)
      .attr("max", max)
      .attr("value", initialValue)
      .css("width", "100%")
      .appendTo(root);
    //@ts-ignore
    rangeInput.on("input", (e) => cb(e.target.value));
    return this;
  }

  number(name: string, cb: (event: number) => void, initialValue?: number) {
    const root = $("<div>")
      .addClass("border-bottom border-secondary d-flex justify-content-between align-items-center p-1")
      .css("height", "30px")
      .appendTo(this._element);
    $("<p/>").addClass("m-0").text(name).css("font-size", "13px").appendTo(root);
    const input = $("<input/>")
      .attr("type", "number")
      .addClass("form-text text-muted bg-secondary text-white border-none")
      .css("width", "90px")
      .css("height", "20px")
      .css("border", "none")
      .attr("value", initialValue || null)
      .appendTo(root);
    //@ts-ignore
    input.on("change", (e) => cb(parseInt(e.target.value)));
    return this;
  }
}

class DevPanel {
  private readonly _parent: JQuery<HTMLElement>;
  constructor(elem: JQuery<HTMLElement>) {
    this._parent = elem;
    this._parent.append($("<div/>").attr("class", "bg-dark w-100 text-white rounded p-1 m-1").attr("id", ROOT_ID));
    this._root.css("width", "450px").css("max-height", "650px").css("overflow", "scroll");
  }

  private get _root() {
    return $(`#${ROOT_ID}`);
  }

  group(name: string, defaultOpen?: boolean) {
    const collapseName = (Math.random() * 100000).toString();
    const groupRoot = $("<div>")
      .attr("id", `${name}-${(Math.random() * 100000).toString()}`)
      .appendTo(this._root);

    const btn = groupRoot.append(
      $("<button>")
        .text(name)
        .addClass("btn btn-sm btn-secondary w-100 border-bottom")
        .attr("type", "button")
        .attr("data-toggle", "collapse")
        .attr("data-target", `#${collapseName}`)
        .attr("aria-controls", collapseName)
    );
    const containerDiv = $("<div>")
      .addClass(`collapse ${defaultOpen && "show"}`)
      .attr("id", collapseName)
      .appendTo(groupRoot);

    btn.on("click", () => containerDiv.toggleClass("show"));
    containerDiv.on("click", (e) => e.stopPropagation());

    return new DevPanelInput(containerDiv);
  }
}

export default DevPanel;
