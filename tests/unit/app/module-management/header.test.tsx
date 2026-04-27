import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const routerMock = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
}));

const searchParamsState = vi.hoisted(() => ({
  returnTo: null as string | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  useSearchParams: () => ({
    get: (key: string) =>
      key === "returnTo" ? searchParamsState.returnTo : null,
  }),
}));

vi.mock("@/components/layout/user-info", () => ({
  UserInfo: () => <div data-user-info="true">使用者資訊</div>,
}));

vi.mock("@/app/module-management/_components/new-module-pop-up", () => ({
  default: () => <div data-new-module-popup="true">新增模組</div>,
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
  public value = "";
  public type = "";
  public disabled = false;

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
    href: "https://readr.test/module-management",
  };
  public readonly Event = MockEvent;
  public readonly MouseEvent = MockMouseEvent;
  public readonly Node = MockNode;
  public readonly HTMLElement = MockElement;
  public readonly SVGElement = MockElement;
  public readonly HTMLIFrameElement = class {};
  public readonly document: MockDocument;
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
}

const mockWindow = new MockWindow();
mockWindow.document.defaultView = mockWindow;

type RenderedHeader = {
  container: MockElement;
  root: Root;
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
  globalObject.IS_REACT_ACT_ENVIRONMENT = true;
}

function resetDomGlobals() {
  routerMock.back.mockReset();
  routerMock.push.mockReset();
  searchParamsState.returnTo = null;
  mockWindow.location.origin = "https://readr.test";
  mockWindow.location.href = "https://readr.test/module-management";
}

function findFirstButton(node: MockNode): MockElement | null {
  if (node instanceof MockElement && node.tagName === "button") {
    return node;
  }

  for (const child of node.childNodes) {
    const found = findFirstButton(child);
    if (found) {
      return found;
    }
  }

  return null;
}

async function renderHeader(): Promise<RenderedHeader> {
  const container = document.createElement("div") as MockElement;
  const root = createRoot(container);

  const { default: Header } = await import(
    "@/app/module-management/_components/header"
  );

  await act(async () => {
    root.render(<Header />);
  });

  return { container, root };
}

describe("module management header", () => {
  beforeEach(() => {
    installDomGlobals();
    resetDomGlobals();
  });

  afterEach(() => {
    document.body.textContent = "";
  });

  it("pushes the returnTo path when it is present", async () => {
    searchParamsState.returnTo = "/dashboard";

    const { container, root } = await renderHeader();
    const button = findFirstButton(container);

    expect(button).not.toBeNull();

    button?.click();

    expect(routerMock.back).not.toHaveBeenCalled();
    expect(routerMock.push).toHaveBeenCalledWith("/dashboard");

    act(() => {
      root.unmount();
    });
  });

  it("falls back to home when returnTo is missing", async () => {
    searchParamsState.returnTo = null;

    const { container, root } = await renderHeader();
    const button = findFirstButton(container);

    expect(button).not.toBeNull();

    button?.click();

    expect(routerMock.back).not.toHaveBeenCalled();
    expect(routerMock.push).toHaveBeenCalledWith("/");

    act(() => {
      root.unmount();
    });
  });

  it("falls back to home when returnTo is unsafe", async () => {
    searchParamsState.returnTo = "https://example.com";

    const { container, root } = await renderHeader();
    const button = findFirstButton(container);

    expect(button).not.toBeNull();

    button?.click();

    expect(routerMock.back).not.toHaveBeenCalled();
    expect(routerMock.push).toHaveBeenCalledWith("/");

    act(() => {
      root.unmount();
    });
  });

  it("falls back to home when returnTo starts with slash-backslash", async () => {
    searchParamsState.returnTo = "/\\example.com";

    const { container, root } = await renderHeader();
    const button = findFirstButton(container);

    expect(button).not.toBeNull();

    button?.click();

    expect(routerMock.back).not.toHaveBeenCalled();
    expect(routerMock.push).toHaveBeenCalledWith("/");

    act(() => {
      root.unmount();
    });
  });
});
