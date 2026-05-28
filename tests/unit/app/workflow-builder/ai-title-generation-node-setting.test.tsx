import React from "react";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AiTitleGenerationNodeData } from "@/components/flow/nodes/ai-title-generation-node";

let applyNodeUpdate:
  | ((data: Partial<AiTitleGenerationNodeData>) => void)
  | null = null;
const updateAiTitleGenerationNodeData = vi.fn(
  (_nodeId: string, data: Partial<AiTitleGenerationNodeData>) => {
    applyNodeUpdate?.(data);
  },
);
const nodeFieldErrors: Record<string, Record<string, string>> = {};
const setNodeFieldError = vi.fn(
  (nodeId: string, field: string, message: string | null) => {
    const currentNodeErrors = { ...(nodeFieldErrors[nodeId] ?? {}) };

    if (message === null) {
      delete currentNodeErrors[field];
    } else {
      currentNodeErrors[field] = message;
    }

    if (Object.keys(currentNodeErrors).length === 0) {
      delete nodeFieldErrors[nodeId];
    } else {
      nodeFieldErrors[nodeId] = currentNodeErrors;
    }
  },
);
const clearNodeFieldErrors = vi.fn((nodeId: string) => {
  delete nodeFieldErrors[nodeId];
});

const mockStoreState = {
  nodes: [] as Array<{
    id: string;
    type: string;
    data: AiTitleGenerationNodeData;
  }>,
  selectedNodeId: null as string | null,
  nodeFieldErrors,
  updateAiTitleGenerationNodeData,
  setNodeFieldError,
  clearNodeFieldErrors,
};

vi.mock("@/stores/flow-editor/nodes-store", () => ({
  useNodesStore: (selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}));

vi.mock("@/components/ui/sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
  appToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/components/ui/custom-select", () => ({
  Select: ({
    children,
    onValueChange,
    value,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    value?: string;
  }) => (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      data-testid="title-style-select"
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => <option value={value}>{children}</option>,
}));

vi.mock("@/components/ui/slider", () => ({
  Slider: ({
    value,
    onValueChange,
    min,
    max,
    step,
  }: {
    value: number[];
    onValueChange: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onInput={(e) =>
        onValueChange([parseFloat((e.target as HTMLInputElement).value)])
      }
    />
  ),
}));

class MockEvent {
  public readonly bubbles: boolean;
  public readonly cancelable: boolean;
  public defaultPrevented = false;
  public propagationStopped = false;
  public target: MockNode | null = null;
  public currentTarget: MockNode | null = null;

  constructor(
    public readonly type: string,
    init: { bubbles?: boolean; cancelable?: boolean } = {},
  ) {
    this.bubbles = init.bubbles ?? false;
    this.cancelable = init.cancelable ?? false;
  }

  stopPropagation() {
    this.propagationStopped = true;
  }

  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }
}

class MockMouseEvent extends MockEvent {}

class MockNode {
  public parentNode: MockNode | null = null;
  public ownerDocument: MockDocument | null = null;
  public readonly childNodes: MockNode[] = [];
  private readonly listeners = new Map<
    string,
    Set<(event: MockEvent) => void>
  >();

  constructor(
    public readonly nodeType: number,
    public readonly nodeName: string,
  ) {}

  appendChild<T extends MockNode>(node: T): T {
    return this.insertBefore(node, null);
  }

  insertBefore<T extends MockNode>(node: T, before: MockNode | null): T {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    const index = before ? this.childNodes.indexOf(before) : -1;
    const insertionIndex = index >= 0 ? index : this.childNodes.length;

    this.childNodes.splice(insertionIndex, 0, node);
    node.parentNode = this;
    node.ownerDocument = this.ownerDocument;

    return node;
  }

  removeChild<T extends MockNode>(node: T): T {
    const index = this.childNodes.indexOf(node);
    if (index >= 0) {
      this.childNodes.splice(index, 1);
      node.parentNode = null;
    }

    return node;
  }

  addEventListener(type: string, listener: (event: MockEvent) => void) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: (event: MockEvent) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: MockEvent) {
    if (!event.target) {
      event.target = this;
    }

    let current: MockNode | null = this;

    while (current) {
      event.currentTarget = current;
      const listeners = current.listeners.get(event.type);

      if (listeners) {
        for (const listener of listeners) {
          listener(event);

          if (event.propagationStopped) {
            return !event.defaultPrevented;
          }
        }
      }

      if (!event.bubbles) {
        break;
      }

      current = current.parentNode;
    }

    return !event.defaultPrevented;
  }

  contains(node: MockNode | null): boolean {
    if (!node) {
      return false;
    }

    if (node === this) {
      return true;
    }

    return this.childNodes.some((child) => child.contains(node));
  }

  get firstChild(): MockNode | null {
    return this.childNodes[0] ?? null;
  }

  get lastChild(): MockNode | null {
    return this.childNodes[this.childNodes.length - 1] ?? null;
  }
}

class MockTextNode extends MockNode {
  public data: string;

  constructor(text: string) {
    super(3, "#text");
    this.data = text;
  }

  get textContent() {
    return this.data;
  }

  set textContent(value: string) {
    this.data = value;
  }
}

class MockElement extends MockNode {
  public readonly attributes = new Map<string, string>();
  public readonly style = {
    setProperty: vi.fn(),
    removeProperty: vi.fn(),
  };
  public className = "";
  public id = "";
  public type = "";
  public disabled = false;
  public multiple = false;
  public defaultValue = "";
  private _value = "";
  private _selected = false;

  constructor(
    public readonly tagName: string,
    public readonly namespaceURI = "http://www.w3.org/1999/xhtml",
  ) {
    super(1, tagName.toUpperCase());
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, String(value));

    if (name === "class") {
      this.className = String(value);
    }

    if (name === "id") {
      this.id = String(value);
    }

    if (name === "value") {
      this._value = String(value);
    }

    if (name === "defaultValue") {
      this.defaultValue = String(value);
      this._value = String(value);
    }

    if (name === "selected") {
      this._selected = value !== "false";
    }
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }

  setAttributeNS(_namespace: string | null, name: string, value: string) {
    this.setAttribute(name, value);
  }

  removeAttributeNS(_namespace: string | null, name: string) {
    this.removeAttribute(name);
  }

  get children() {
    return this.childNodes.filter(
      (node): node is MockElement => node.nodeType === 1,
    );
  }

  get options() {
    if (this.tagName !== "select") {
      return undefined;
    }

    return this.children.filter((node) => node.tagName === "option");
  }

  get value() {
    if (this.tagName === "select") {
      const selectedOption = this.options?.find((option) => option.selected);
      return selectedOption?.value ?? this._value;
    }

    if (this.tagName === "textarea" && !this._value) {
      return this.textContent;
    }

    return this._value;
  }

  set value(value: string) {
    this._value = value;
    this.defaultValue = value;

    if (this.tagName === "select") {
      for (const option of this.options ?? []) {
        option.selected = option.value === value;
      }
    }

    if (this.tagName === "textarea") {
      this.textContent = value;
    }
  }

  get selected() {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = value;
  }

  get textContent() {
    return this.childNodes
      .map((node) => (node as MockTextNode).textContent)
      .join("");
  }

  set textContent(value: string) {
    this.childNodes.splice(0, this.childNodes.length);

    if (value) {
      this.appendChild(new MockTextNode(value));
    }
  }

  click() {
    this.dispatchEvent(new MockMouseEvent("click", { bubbles: true }));
  }
}

class MockDocument extends MockNode {
  public readonly documentElement: MockElement;
  public readonly body: MockElement;
  public defaultView!: MockWindow;

  constructor() {
    super(9, "#document");

    this.documentElement = new MockElement("html");
    this.body = new MockElement("body");

    this.documentElement.ownerDocument = this;
    this.body.ownerDocument = this;
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
  }

  createElement(tagName: string) {
    const element = new MockElement(tagName);
    element.ownerDocument = this;
    return element;
  }

  createElementNS(namespaceURI: string | null, tagName: string) {
    const element = new MockElement(tagName, namespaceURI ?? undefined);
    element.ownerDocument = this;
    return element;
  }

  createTextNode(text: string) {
    const node = new MockTextNode(text);
    node.ownerDocument = this;
    return node;
  }

  get activeElement() {
    return this.body;
  }

  hasFocus() {
    return true;
  }
}

class MockWindow {
  public readonly navigator = { userAgent: "test" };
  public readonly location = {
    origin: "https://readr.test",
    href: "https://readr.test/workflow-builder",
  };
  public innerWidth = 1280;
  public readonly Event = MockEvent;
  public readonly MouseEvent = MockMouseEvent;
  public readonly Node = MockNode;
  public readonly HTMLElement = MockElement;
  public readonly SVGElement = MockElement;
  public readonly HTMLIFrameElement = class {};
  public readonly document: MockDocument;
  public readonly setTimeout = globalThis.setTimeout.bind(globalThis);
  public readonly clearTimeout = globalThis.clearTimeout.bind(globalThis);
  public readonly requestAnimationFrame = (callback: FrameRequestCallback) =>
    this.setTimeout(() => callback(Date.now()), 0);
  public readonly cancelAnimationFrame = (handle: number) =>
    this.clearTimeout(handle);
  private readonly listeners = new Map<
    string,
    Set<(event: MockEvent) => void>
  >();

  constructor() {
    this.document = new MockDocument();
  }

  addEventListener(type: string, listener: (event: MockEvent) => void) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: (event: MockEvent) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: MockEvent) {
    const listeners = this.listeners.get(event.type);
    if (!listeners) {
      return true;
    }

    for (const listener of listeners) {
      listener(event);
    }

    return !event.defaultPrevented;
  }

  matchMedia(query: string) {
    return {
      media: query,
      matches: false,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn().mockReturnValue(true),
    };
  }
}

const mockWindow = new MockWindow();
mockWindow.document.defaultView = mockWindow;

const originalDomGlobals = {
  window: (
    globalThis as typeof globalThis & {
      window?: typeof globalThis.window;
    }
  ).window,
  document: (
    globalThis as typeof globalThis & {
      document?: typeof globalThis.document;
    }
  ).document,
  navigator: globalThis.navigator,
  Node: globalThis.Node,
  HTMLElement: globalThis.HTMLElement,
  SVGElement: globalThis.SVGElement,
  HTMLIFrameElement: globalThis.HTMLIFrameElement,
  Event: globalThis.Event,
  MouseEvent: globalThis.MouseEvent,
  setTimeout: globalThis.setTimeout,
  clearTimeout: globalThis.clearTimeout,
  requestAnimationFrame: globalThis.requestAnimationFrame,
  cancelAnimationFrame: globalThis.cancelAnimationFrame,
  matchMedia: (
    globalThis as typeof globalThis & {
      matchMedia?: typeof window.matchMedia;
    }
  ).matchMedia,
  isReactActEnvironment: (
    globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean;
    }
  ).IS_REACT_ACT_ENVIRONMENT,
};

type RenderedTree = {
  container: MockElement;
  root: Root;
  rerender?: () => Promise<void>;
};

const sampleData: AiTitleGenerationNodeData = {
  title: "AI 文章標題",
  titleStyle: "seo",
  titleTemperature: 0.5,
  titleKeywords: "",
};

function installDomGlobals() {
  const globalObject = globalThis as typeof globalThis & {
    window?: MockWindow;
    document?: MockDocument;
    navigator?: { userAgent: string };
    Node?: typeof MockNode;
    HTMLElement?: typeof MockElement;
    SVGElement?: typeof MockElement;
    HTMLIFrameElement?: typeof MockWindow.prototype.HTMLIFrameElement;
    Event?: typeof MockEvent;
    MouseEvent?: typeof MockMouseEvent;
  };

  globalObject.window = mockWindow as unknown as Window &
    typeof globalThis &
    MockWindow;
  globalObject.document = mockWindow.document as unknown as Document &
    typeof globalThis &
    MockDocument;
  Object.defineProperty(globalObject, "navigator", {
    value: mockWindow.navigator,
    configurable: true,
    writable: true,
  });
  globalObject.Node = MockNode as unknown as Node & {
    new (): Node;
    prototype: Node;
    readonly ELEMENT_NODE: 1;
    readonly ATTRIBUTE_NODE: 2;
    readonly TEXT_NODE: 3;
    readonly CDATA_SECTION_NODE: 4;
    readonly ENTITY_REFERENCE_NODE: 5;
  } & typeof MockNode;
  globalObject.HTMLElement = MockElement as unknown as {
    new (): HTMLElement;
    prototype: HTMLElement;
  } & typeof MockElement;
  globalObject.SVGElement = MockElement as unknown as {
    new (): SVGElement;
    prototype: SVGElement;
  } & typeof MockElement;
  globalObject.HTMLIFrameElement = mockWindow.HTMLIFrameElement as unknown as {
    new (): HTMLIFrameElement;
    prototype: HTMLIFrameElement;
  } & typeof MockWindow.prototype.HTMLIFrameElement;
  globalObject.Event = MockEvent as unknown as {
    new (type: string, eventInitDict?: EventInit | undefined): Event;
    prototype: Event;
    readonly NONE: 0;
    readonly CAPTURING_PHASE: 1;
    readonly AT_TARGET: 2;
    readonly BUBBLING_PHASE: 3;
  } & typeof MockEvent;
  globalObject.MouseEvent = MockMouseEvent as unknown as {
    new (type: string, eventInitDict?: MouseEventInit | undefined): MouseEvent;
    prototype: MouseEvent;
  } & typeof MockMouseEvent;
  globalObject.setTimeout =
    mockWindow.setTimeout as unknown as typeof setTimeout;
  globalObject.clearTimeout = mockWindow.clearTimeout;
  globalObject.requestAnimationFrame =
    mockWindow.requestAnimationFrame as unknown as (
      callback: FrameRequestCallback,
    ) => number;
  globalObject.cancelAnimationFrame = mockWindow.cancelAnimationFrame;
  globalObject.matchMedia = mockWindow.matchMedia.bind(mockWindow);
  (
    globalObject as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
}

function resetDomGlobals() {
  updateAiTitleGenerationNodeData.mockClear();
  setNodeFieldError.mockClear();
  clearNodeFieldErrors.mockClear();
  for (const key of Object.keys(nodeFieldErrors)) {
    delete nodeFieldErrors[key];
  }
  mockStoreState.nodes = [];
  mockStoreState.selectedNodeId = null;
  applyNodeUpdate = null;
}

function restoreDomGlobals() {
  const globalObject = globalThis as typeof globalThis & {
    window?: typeof originalDomGlobals.window;
    document?: typeof originalDomGlobals.document;
    navigator?: typeof originalDomGlobals.navigator;
    Node?: typeof originalDomGlobals.Node;
    HTMLElement?: typeof originalDomGlobals.HTMLElement;
    SVGElement?: typeof originalDomGlobals.SVGElement;
    HTMLIFrameElement?: typeof originalDomGlobals.HTMLIFrameElement;
    Event?: typeof originalDomGlobals.Event;
    MouseEvent?: typeof originalDomGlobals.MouseEvent;
    setTimeout?: typeof originalDomGlobals.setTimeout;
    clearTimeout?: typeof originalDomGlobals.clearTimeout;
    requestAnimationFrame?: typeof originalDomGlobals.requestAnimationFrame;
    cancelAnimationFrame?: typeof originalDomGlobals.cancelAnimationFrame;
    matchMedia?: typeof originalDomGlobals.matchMedia;
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  };

  globalObject.window = originalDomGlobals.window;
  globalObject.document = originalDomGlobals.document;
  Object.defineProperty(globalObject, "navigator", {
    value: originalDomGlobals.navigator,
    configurable: true,
    writable: true,
  });
  globalObject.Node = originalDomGlobals.Node;
  globalObject.HTMLElement = originalDomGlobals.HTMLElement;
  globalObject.SVGElement = originalDomGlobals.SVGElement;
  globalObject.HTMLIFrameElement = originalDomGlobals.HTMLIFrameElement;
  globalObject.Event = originalDomGlobals.Event;
  globalObject.MouseEvent = originalDomGlobals.MouseEvent;
  globalObject.setTimeout = originalDomGlobals.setTimeout;
  globalObject.clearTimeout = originalDomGlobals.clearTimeout;
  globalObject.requestAnimationFrame = originalDomGlobals.requestAnimationFrame;
  globalObject.cancelAnimationFrame = originalDomGlobals.cancelAnimationFrame;
  globalObject.matchMedia = originalDomGlobals.matchMedia;
  globalObject.IS_REACT_ACT_ENVIRONMENT =
    originalDomGlobals.isReactActEnvironment;
}

function findAllByTagName(node: MockNode, tagName: string): MockElement[] {
  const matches: MockElement[] = [];

  const visit = (current: MockNode) => {
    if (current instanceof MockElement && current.tagName === tagName) {
      matches.push(current);
    }

    for (const child of current.childNodes) {
      visit(child);
    }
  };

  visit(node);
  return matches;
}

async function renderTitleGenerationSettings(
  data = sampleData,
): Promise<RenderedTree> {
  const container = document.createElement("div") as unknown as MockElement;
  const root = createRoot(container as unknown as Element | DocumentFragment);

  const { default: AiTitleGenerationNodeSetting } =
    await import("@/app/[workflow-builder]/components/node-settings/ai-title-generation-node-setting");

  await act(async () => {
    root.render(
      <AiTitleGenerationNodeSetting nodeId="aiTitle-node" data={data} />,
    );
  });

  return { container, root };
}

async function renderControlledTitleGenerationSettings(): Promise<RenderedTree> {
  const container = document.createElement("div") as unknown as MockElement;
  const root = createRoot(container as unknown as Element | DocumentFragment);

  const { default: AiTitleGenerationNodeSetting } =
    await import("@/app/[workflow-builder]/components/node-settings/ai-title-generation-node-setting");

  const ControlledHarness = () => {
    const [data, setData] = useState(sampleData);

    applyNodeUpdate = (nextData) => {
      setData((current) => ({ ...current, ...nextData }));
    };

    return <AiTitleGenerationNodeSetting nodeId="aiTitle-node" data={data} />;
  };

  const rerender = async () => {
    await act(async () => {
      root.render(<ControlledHarness />);
    });
  };

  await rerender();

  return { container, root, rerender };
}

describe("ai title generation node setting", () => {
  beforeEach(() => {
    installDomGlobals();
    resetDomGlobals();
  });

  afterEach(() => {
    document.body.textContent = "";
    restoreDomGlobals();
  });

  it("renders the dedicated aiTitle settings panel with correct sections", async () => {
    const { container } = await renderTitleGenerationSettings();

    expect(container.textContent).toContain("標題風格選擇");
    expect(container.textContent).toContain("創意溫度控制");
    expect(container.textContent).toContain("SEO 強制關鍵字");
    expect(container.textContent).not.toContain("titleStyle");
    expect(container.textContent).not.toContain("titleTemperature");
    expect(container.textContent).not.toContain("titleKeywords");
  });

  it("shows the current temperature value", async () => {
    const { container } = await renderTitleGenerationSettings({
      ...sampleData,
      titleTemperature: 0.7,
    });

    expect(container.textContent).toContain("0.7");
  });

  it("updates titleTemperature when slider value changes", async () => {
    const { container } = await renderControlledTitleGenerationSettings();

    const inputs = findAllByTagName(container, "input");
    const rangeInput = inputs.find(
      (el) => el.getAttribute("type") === "range" || el.type === "range",
    );

    expect(rangeInput).toBeDefined();

    act(() => {
      if (rangeInput) {
        rangeInput.value = "0.8";
        rangeInput.dispatchEvent(new MockEvent("input", { bubbles: true }));
      }
    });

    expect(updateAiTitleGenerationNodeData).toHaveBeenCalledWith(
      "aiTitle-node",
      {
        titleTemperature: 0.8,
      },
    );
  });

  it("updates titleKeywords when input changes with valid value", async () => {
    const { container } = await renderControlledTitleGenerationSettings();

    const inputs = findAllByTagName(container, "input");
    const keywordsInput = inputs.find(
      (el) => el.getAttribute("placeholder") === "請輸入關鍵字",
    );

    expect(keywordsInput).toBeDefined();

    act(() => {
      if (keywordsInput) {
        keywordsInput.value = "AI,新聞";
        keywordsInput.dispatchEvent(new MockEvent("input", { bubbles: true }));
      }
    });

    expect(updateAiTitleGenerationNodeData).toHaveBeenCalledWith(
      "aiTitle-node",
      {
        titleKeywords: "AI,新聞",
      },
    );
    expect(setNodeFieldError).toHaveBeenCalledWith(
      "aiTitle-node",
      "titleKeywords",
      null,
    );
  });

  it("shows error and blocks store update when keywords exceed 3", async () => {
    const { container } = await renderControlledTitleGenerationSettings();

    const inputs = findAllByTagName(container, "input");
    const keywordsInput = inputs.find(
      (el) => el.getAttribute("placeholder") === "請輸入關鍵字",
    );

    act(() => {
      if (keywordsInput) {
        keywordsInput.value = "AI,新聞,ETF,台股";
        keywordsInput.dispatchEvent(new MockEvent("input", { bubbles: true }));
      }
    });

    expect(setNodeFieldError).toHaveBeenCalledWith(
      "aiTitle-node",
      "titleKeywords",
      "關鍵字限輸入1-3個",
    );
    expect(container.textContent).toContain("關鍵字限輸入1-3個");

    const callsWithData = updateAiTitleGenerationNodeData.mock.calls.filter(
      (call) => "titleKeywords" in call[1],
    );
    expect(callsWithData).toHaveLength(0);
  });

  it("clears node field errors on unmount", async () => {
    const { root } = await renderTitleGenerationSettings();

    await act(async () => {
      root.unmount();
    });

    expect(clearNodeFieldErrors).toHaveBeenCalledWith("aiTitle-node");
  });

  it("sets field error in store on mount when data has invalid keywords", async () => {
    const dataWithInvalidKeywords: AiTitleGenerationNodeData = {
      ...sampleData,
      titleKeywords: "一,二,三,四",
    };

    await renderTitleGenerationSettings(dataWithInvalidKeywords);

    expect(setNodeFieldError).toHaveBeenCalledWith(
      "aiTitle-node",
      "titleKeywords",
      "關鍵字限輸入1-3個",
    );
  });

  it("does not set field error in store on mount when keywords are empty", async () => {
    await renderTitleGenerationSettings({ ...sampleData, titleKeywords: "" });

    expect(setNodeFieldError).toHaveBeenCalledWith(
      "aiTitle-node",
      "titleKeywords",
      null,
    );
  });
});
