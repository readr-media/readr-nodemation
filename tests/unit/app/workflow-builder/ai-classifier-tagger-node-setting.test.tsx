import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AiClassifierTaggerNodeData } from "@/components/flow/nodes/ai-classifier-tagger-node";
import { SidebarProvider } from "@/components/ui/sidebar";

const updateAiClassifierTaggerNodeData = vi.fn();

const mockStoreState = {
  nodes: [] as Array<{
    id: string;
    type: string;
    data: AiClassifierTaggerNodeData;
  }>,
  selectedNodeId: null as string | null,
  updateAiClassifierTaggerNodeData,
};

vi.mock("@/stores/flow-editor/nodes-store", () => ({
  useNodesStore: (selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
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

  get firstChild() {
    return this.childNodes[0] ?? null;
  }

  get lastChild() {
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
    return this.childNodes.map((node) => node.textContent).join("");
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
};

const sampleData: AiClassifierTaggerNodeData = {
  title: "AI自動分類與標籤",
  model: "gemini-1.5-flash",
  inputFields: {
    title: "source.title",
    content: "source.content",
  },
  promptTemplate: "prompt template",
  categoryAmount: 1,
  tagAmount: 3,
  responseFormat: {
    type: "json",
    schema: {
      categories: "array[string]",
      tags: "array[string]",
    },
  },
  outputFields: {
    categories: "array[string]",
    tags: "array[string]",
  },
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

  globalObject.window = mockWindow;
  globalObject.document = mockWindow.document;
  globalObject.navigator = mockWindow.navigator;
  globalObject.Node = MockNode;
  globalObject.HTMLElement = MockElement;
  globalObject.SVGElement = MockElement;
  globalObject.HTMLIFrameElement = mockWindow.HTMLIFrameElement;
  globalObject.Event = MockEvent;
  globalObject.MouseEvent = MockMouseEvent;
  globalObject.setTimeout = mockWindow.setTimeout;
  globalObject.clearTimeout = mockWindow.clearTimeout;
  globalObject.requestAnimationFrame = mockWindow.requestAnimationFrame;
  globalObject.cancelAnimationFrame = mockWindow.cancelAnimationFrame;
  globalObject.matchMedia = mockWindow.matchMedia.bind(mockWindow);
  globalObject.IS_REACT_ACT_ENVIRONMENT = true;
}

function resetDomGlobals() {
  updateAiClassifierTaggerNodeData.mockClear();
  mockStoreState.nodes = [];
  mockStoreState.selectedNodeId = null;
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
  globalObject.navigator = originalDomGlobals.navigator;
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

async function renderClassifierTaggerSettings(): Promise<RenderedTree> {
  const container = document.createElement("div") as MockElement;
  const root = createRoot(container);

  const { default: AiClassifierTaggerNodeSetting } = await import(
    "@/app/[workflow-builder]/components/node-settings/ai-classifier-tagger-node-setting"
  );

  await act(async () => {
    root.render(
      <AiClassifierTaggerNodeSetting
        nodeId="aiClassifierTagger-node"
        data={sampleData}
      />,
    );
  });

  return { container, root };
}

describe("ai classifier tagger node setting", () => {
  beforeEach(() => {
    installDomGlobals();
    resetDomGlobals();
  });

  afterEach(() => {
    document.body.textContent = "";
    restoreDomGlobals();
  });

  it("renders and updates the dedicated aiClassifierTagger settings panel", async () => {
    const { container, root } = await renderClassifierTaggerSettings();

    expect(container.textContent).toContain("AI自動分類與標籤設定");
    expect(container.textContent).toContain("模型版本");
    expect(container.textContent).toContain("標題欄位 mapping");
    expect(container.textContent).toContain("內文欄位 mapping");
    expect(container.textContent).toContain("Prompt 模板");
    expect(container.textContent).toContain("產生分類數量");
    expect(container.textContent).toContain("產生標籤數量");
    expect(container.textContent).not.toContain("responseFormat");
    expect(container.textContent).not.toContain("outputFields");

    const selects = findAllByTagName(container, "select");
    const textareas = findAllByTagName(container, "textarea");
    const inputs = findAllByTagName(container, "input");

    expect(selects).toHaveLength(1);
    expect(textareas).toHaveLength(1);
    expect(inputs).toHaveLength(4);

    const select = selects[0];
    const [titleInput, contentInput, categoryInput, tagInput] = inputs;
    const promptInput = textareas[0];

    expect(select).not.toBeNull();
    expect(titleInput).not.toBeNull();
    expect(contentInput).not.toBeNull();
    expect(categoryInput).not.toBeNull();
    expect(tagInput).not.toBeNull();
    expect(promptInput).not.toBeNull();
    expect((select as HTMLSelectElement).value).toBe("gemini-1.5-flash");
    expect((titleInput as HTMLInputElement).value).toBe("source.title");
    expect((contentInput as HTMLInputElement).value).toBe("source.content");
    expect((categoryInput as HTMLInputElement).value).toBe("1");
    expect((tagInput as HTMLInputElement).value).toBe("3");

    act(() => {
      select.value = "gemini-1.5-pro";
      select.dispatchEvent(new MockEvent("change", { bubbles: true }));
    });

    expect(updateAiClassifierTaggerNodeData).toHaveBeenNthCalledWith(
      1,
      "aiClassifierTagger-node",
      {
        model: "gemini-1.5-pro",
      },
    );

    act(() => {
      titleInput.value = "source.headline";
      titleInput.dispatchEvent(new MockEvent("input", { bubbles: true }));
    });

    expect(updateAiClassifierTaggerNodeData).toHaveBeenNthCalledWith(
      2,
      "aiClassifierTagger-node",
      {
        inputFields: {
          title: "source.headline",
          content: "source.content",
        },
      },
    );

    act(() => {
      contentInput.value = "source.body";
      contentInput.dispatchEvent(new MockEvent("input", { bubbles: true }));
    });

    expect(updateAiClassifierTaggerNodeData).toHaveBeenNthCalledWith(
      3,
      "aiClassifierTagger-node",
      {
        inputFields: {
          title: "source.title",
          content: "source.body",
        },
      },
    );

    act(() => {
      promptInput.value = "updated prompt";
      promptInput.dispatchEvent(new MockEvent("input", { bubbles: true }));
    });

    expect(updateAiClassifierTaggerNodeData).toHaveBeenNthCalledWith(
      4,
      "aiClassifierTagger-node",
      {
        promptTemplate: "updated prompt",
      },
    );

    act(() => {
      categoryInput.value = "2";
      categoryInput.dispatchEvent(new MockEvent("input", { bubbles: true }));
    });

    expect(updateAiClassifierTaggerNodeData).toHaveBeenNthCalledWith(
      5,
      "aiClassifierTagger-node",
      {
        categoryAmount: 2,
      },
    );

    act(() => {
      tagInput.value = "5";
      tagInput.dispatchEvent(new MockEvent("input", { bubbles: true }));
    });

    expect(updateAiClassifierTaggerNodeData).toHaveBeenNthCalledWith(
      6,
      "aiClassifierTagger-node",
      {
        tagAmount: 5,
      },
    );

    act(() => {
      categoryInput.value = "-1";
      categoryInput.dispatchEvent(new MockEvent("input", { bubbles: true }));
    });

    expect(updateAiClassifierTaggerNodeData).toHaveBeenCalledTimes(6);

    act(() => {
      categoryInput.value = "1.5";
      categoryInput.dispatchEvent(new MockEvent("input", { bubbles: true }));
    });

    expect(updateAiClassifierTaggerNodeData).toHaveBeenCalledTimes(6);

    act(() => {
      root.unmount();
    });
  });

  it("renders the dedicated settings panel from the sidebar", async () => {
    mockStoreState.nodes = [
      {
        id: "aiClassifierTagger-node",
        type: "aiClassifierTagger",
        data: sampleData,
      },
    ];
    mockStoreState.selectedNodeId = "aiClassifierTagger-node";

    const { default: NodeSettingSidebar } = await import(
      "@/app/[workflow-builder]/components/node-setting-sidebar"
    );

    const container = document.createElement("div") as MockElement;
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <SidebarProvider defaultOpen>
          <NodeSettingSidebar />
        </SidebarProvider>,
      );
    });

    expect(container.textContent).toContain("AI自動分類與標籤設定");

    act(() => {
      root.unmount();
    });
  });
});
