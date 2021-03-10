import singleSpaReact from "./single-spa-react.js";
import "@testing-library/jest-dom/extend-expect";

describe("single-spa-react", () => {
  let React,
    ReactDOM,
    rootComponent,
    domElement,
    domElementGetter,
    componentInstance,
    createdReactElement;

  beforeEach(() => {
    (React = {
      createElement: jest.fn(() => {
        return createdReactElement;
      }),
      Component: function () {},
      version: "16.2.0",
    }),
      (ReactDOM = {
        render: jest.fn((reactEl, domEl, cbk) => {
          cbk();
          return componentInstance;
        }),
        hydrate: jest.fn((reactEl, domEl, cbk) => {
          cbk();
          return componentInstance;
        }),
        createRoot: jest.fn((domEl) => {
          return {
            render: jest.fn((reactEl, cbk) => {
              cbk();
              return componentInstance;
            }),
          };
        }),
        unstable_createRoot: jest.fn((domEl) => {
          return {
            render: jest.fn((reactEl, cbk) => {
              cbk();
              return componentInstance;
            }),
          };
        }),
        createBlockingRoot: jest.fn((domEl) => {
          return {
            render: jest.fn((reactEl, cbk) => {
              cbk();
              return componentInstance;
            }),
          };
        }),
        unstable_createBlockingRoot: jest.fn((domEl) => {
          return {
            render: jest.fn((reactEl, cbk) => {
              cbk();
              return componentInstance;
            }),
          };
        }),
        unmountComponentAtNode: jest.fn(),
      });

    createdReactElement = "Hey a created react element";
    componentInstance = { componentDidCatch: () => {} };
    rootComponent = jest.fn();
    domElement = "Hey i'm the dom element";
    domElementGetter = jest.fn().mockImplementation(() => domElement);

    console.warn = jest.fn();
  });

  it(`throws an error if you don't pass required opts`, () => {
    expect(() => singleSpaReact()).toThrow();
    expect(() => singleSpaReact({})).toThrow();
    expect(() => singleSpaReact({ ReactDOM, rootComponent })).toThrow();
    expect(() => singleSpaReact({ React, rootComponent })).toThrow();
    expect(() => singleSpaReact({ React, ReactDOM })).toThrow();
  });

  it(`mounts and unmounts a React component, passing through the single-spa props`, () => {
    const props = { why: "hello" };
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      domElementGetter,
    });

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(React.createElement).toHaveBeenCalled();
        expect(React.createElement.mock.calls[0][0]).toEqual(rootComponent);
        expect(React.createElement.mock.calls[0][1]).toEqual(props);
        expect(ReactDOM.render).toHaveBeenCalled();
        expect(ReactDOM.render.mock.calls[0][0]).toEqual(createdReactElement);
        expect(ReactDOM.render.mock.calls[0][1]).toEqual(domElement);
        expect(typeof ReactDOM.render.mock.calls[0][2]).toEqual("function");
        return lifecycles.unmount(props);
      })
      .then(() => {
        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(
          domElement
        );
      });
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'hydrate'`, () => {
    const props = { why: "hello" };
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      domElementGetter,
      renderType: "hydrate",
    });

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(React.createElement).toHaveBeenCalled();
        expect(React.createElement.mock.calls[0][0]).toEqual(rootComponent);
        expect(React.createElement.mock.calls[0][1]).toEqual(props);
        expect(ReactDOM.hydrate).toHaveBeenCalled();
        expect(ReactDOM.hydrate.mock.calls[0][0]).toEqual(createdReactElement);
        expect(ReactDOM.hydrate.mock.calls[0][1]).toEqual(domElement);
        expect(typeof ReactDOM.hydrate.mock.calls[0][2]).toEqual("function");
        return lifecycles.unmount(props);
      })
      .then(() => {
        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(
          domElement
        );
      });
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'createRoot'`, () => {
    const props = { why: "hello" };
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      domElementGetter,
      renderType: "createRoot",
    });

    const createRootRender = jest.fn();
    ReactDOM.createRoot.mockImplementation((domEl) => {
      return {
        render: createRootRender.mockImplementation((reactEl, cbk) => {
          cbk();
          return componentInstance;
        }),
      };
    });

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(React.createElement).toHaveBeenCalled();
        expect(React.createElement.mock.calls[0][0]).toEqual(rootComponent);
        expect(React.createElement.mock.calls[0][1]).toEqual(props);
        expect(ReactDOM.createRoot).toHaveBeenCalled();
        expect(ReactDOM.createRoot.mock.calls[0][0]).toEqual(domElement);
        expect(createRootRender.mock.calls[0][0]).toEqual(createdReactElement);
        expect(typeof createRootRender.mock.calls[0][1]).toEqual("function");
        return lifecycles.unmount(props);
      })
      .then(() => {
        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(
          domElement
        );
      });
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'unstable_createRoot'`, () => {
    const props = { why: "hello" };
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      domElementGetter,
      renderType: "unstable_createRoot",
    });

    const createRootRender = jest.fn();
    ReactDOM.unstable_createRoot.mockImplementation((domEl) => {
      return {
        render: createRootRender.mockImplementation((reactEl, cbk) => {
          cbk();
          return componentInstance;
        }),
      };
    });

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(React.createElement).toHaveBeenCalled();
        expect(React.createElement.mock.calls[0][0]).toEqual(rootComponent);
        expect(React.createElement.mock.calls[0][1]).toEqual(props);
        expect(ReactDOM.unstable_createRoot).toHaveBeenCalled();
        expect(ReactDOM.unstable_createRoot.mock.calls[0][0]).toEqual(
          domElement
        );
        expect(createRootRender.mock.calls[0][0]).toEqual(createdReactElement);
        expect(typeof createRootRender.mock.calls[0][1]).toEqual("function");
        return lifecycles.unmount(props);
      })
      .then(() => {
        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(
          domElement
        );
      });
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'createBlockingRoot'`, () => {
    const props = { why: "hello" };
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      domElementGetter,
      renderType: "createBlockingRoot",
    });

    const createRootRender = jest.fn();
    ReactDOM.createBlockingRoot.mockImplementation((domEl) => {
      return {
        render: createRootRender.mockImplementation((reactEl, cbk) => {
          cbk();
          return componentInstance;
        }),
      };
    });

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(React.createElement).toHaveBeenCalled();
        expect(React.createElement.mock.calls[0][0]).toEqual(rootComponent);
        expect(React.createElement.mock.calls[0][1]).toEqual(props);
        expect(ReactDOM.createBlockingRoot).toHaveBeenCalled();
        expect(ReactDOM.createBlockingRoot.mock.calls[0][0]).toEqual(
          domElement
        );
        expect(createRootRender.mock.calls[0][0]).toEqual(createdReactElement);
        expect(typeof createRootRender.mock.calls[0][1]).toEqual("function");
        return lifecycles.unmount(props);
      })
      .then(() => {
        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(
          domElement
        );
      });
  });

  it(`mounts and unmounts a React component with a 'renderType' of 'unstable_createBlockingRoot'`, () => {
    const props = { why: "hello" };
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      domElementGetter,
      renderType: "unstable_createBlockingRoot",
    });

    const createRootRender = jest.fn();
    ReactDOM.unstable_createBlockingRoot.mockImplementation((domEl) => {
      return {
        render: createRootRender.mockImplementation((reactEl, cbk) => {
          cbk();
          return componentInstance;
        }),
      };
    });

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(React.createElement).toHaveBeenCalled();
        expect(React.createElement.mock.calls[0][0]).toEqual(rootComponent);
        expect(React.createElement.mock.calls[0][1]).toEqual(props);
        expect(ReactDOM.unstable_createBlockingRoot).toHaveBeenCalled();
        expect(ReactDOM.unstable_createBlockingRoot.mock.calls[0][0]).toEqual(
          domElement
        );
        expect(createRootRender.mock.calls[0][0]).toEqual(createdReactElement);
        expect(typeof createRootRender.mock.calls[0][1]).toEqual("function");
        return lifecycles.unmount(props);
      })
      .then(() => {
        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(
          domElement
        );
      });
  });

  it(`chooses the parcel dom element over other dom element getters`, () => {
    const optsDomElementGetter = () => "optsDomElementGetter";
    let opts = {
      React,
      ReactDOM,
      rootComponent,
      domElementGetter: optsDomElementGetter,
    };
    let propsDomElementGetter = () => "propsDomElementGetter";
    let propsDomElement = () => "propsDomElement";
    let props = {
      domElement: propsDomElement,
      domElementGetter: propsDomElementGetter,
    };

    const lifecycles = singleSpaReact(opts);

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => lifecycles.unmount(props))
      .then(() => {
        expect(ReactDOM.render).toHaveBeenCalled();
        // prefer customProp dom element over everything because it's how parcels work
        expect(ReactDOM.render.mock.calls[0][1]).toBe(propsDomElement);
      });
  });

  it(`correctly handles two parcels using the same configuration`, () => {
    let opts = { React, ReactDOM, rootComponent };

    let props1 = { domElement: "element1" };
    let props2 = { domElement: "element2" };
    const lifecycles = singleSpaReact(opts);

    return (
      lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props1))
        .then(() => lifecycles.unmount(props1))
        .then(() => {
          expect(ReactDOM.render).toHaveBeenCalled();
          expect(ReactDOM.render.mock.calls.length).toBe(1);
          expect(ReactDOM.render.mock.calls[0][1]).toBe("element1");
          expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalled();
          expect(ReactDOM.unmountComponentAtNode.mock.calls.length).toBe(1);
          expect(ReactDOM.unmountComponentAtNode.mock.calls[0][0]).toBe(
            "element1"
          );
        })
        // simulate another parcel using the same configuration
        .then(() => lifecycles.bootstrap())
        .then(() => lifecycles.mount(props2))
        .then(() => lifecycles.unmount(props2))
        .then(() => {
          expect(ReactDOM.render.mock.calls.length).toBe(2);
          expect(ReactDOM.render.mock.calls[1][1]).toBe("element2");
          expect(ReactDOM.unmountComponentAtNode.mock.calls.length).toBe(2);
          expect(ReactDOM.unmountComponentAtNode.mock.calls[1][0]).toBe(
            "element2"
          );
        })
    );
  });

  it(`allows you to provide a domElementGetter as an opt`, () => {
    const props = { why: "hello" };
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      domElementGetter,
    });

    return lifecycles.bootstrap().then(() => lifecycles.mount(props));
    // Doesn't throw
  });

  it(`allows you to provide a domElementGetter as a prop`, () => {
    const props = { why: "hello", domElementGetter };
    const lifecycles = singleSpaReact({ React, ReactDOM, rootComponent });

    return lifecycles.bootstrap().then(() => lifecycles.mount(props));
    // Doesn't throw
  });

  it(`uses the dom element that was used for mount when unmounting`, () => {
    const opts = { React, ReactDOM, rootComponent };
    const props = { domElementGetter };

    const lifecycles = singleSpaReact(opts);

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => expect(domElementGetter).toHaveBeenCalledTimes(1))
      .then(() => lifecycles.unmount(props))
      .then(() => expect(domElementGetter).toHaveBeenCalledTimes(1));
  });

  it(`doesn't throw an error if unmount is not called with a dom element or dom element getter`, () => {
    const opts = { React, ReactDOM, rootComponent };
    const props = { domElementGetter };

    const lifecycles = singleSpaReact(opts);

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => {
        expect(domElementGetter).toHaveBeenCalledTimes(1);

        // The domElementGetter should no longer be required after mount is finished
        delete props.domElementGetter;
      })
      .then(() => lifecycles.unmount(props))
      .then(() => expect(domElementGetter).toHaveBeenCalledTimes(1));
  });

  it(`warns if you are using react 16 but don't implement componentDidCatch`, () => {
    delete componentInstance.componentDidCatch;
    React.version = "16.2.0";
    const props = { why: "hello" };
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      domElementGetter,
    });

    return lifecycles
      .bootstrap()
      .then(() => expect(console.warn).not.toHaveBeenCalled())
      .then(() => lifecycles.mount(props))
      .then(() => expect(console.warn).toHaveBeenCalled());
  });

  it(`does not warn if you are using react 15 but don't implement componentDidCatch`, () => {
    delete componentInstance.componentDidCatch;
    React.version = "15.4.1";
    const props = { why: "hello" };
    const lifecycles = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
      domElementGetter,
    });

    return lifecycles
      .bootstrap()
      .then(() => lifecycles.mount(props))
      .then(() => expect(console.warn).not.toHaveBeenCalled());
  });

  // https://github.com/single-spa/single-spa/issues/604
  it(`does not throw an error if a customProps prop is provided`, async () => {
    const parcelConfig = singleSpaReact({
      React,
      ReactDOM,
      rootComponent,
    });
    const normalProps = { foo: "bar", name: "app1" };
    await parcelConfig.bootstrap(normalProps);
    await parcelConfig.mount(normalProps);

    const unusualProps = { name: "app2", customProps: { foo: "bar" } };
    await parcelConfig.bootstrap(unusualProps);
    await parcelConfig.mount(unusualProps);
  });

  describe("error boundaries", () => {
    let originalWarn;
    beforeEach(() => {
      originalWarn = console.warn;
      console.warn = jest.fn();
    });

    afterEach(() => {
      console.warn = originalWarn;
    });

    it(`should not log a warning`, () => {
      const props = { why: "hello" };
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: class rootComponent {
          componentDidCatch() {}
        },
        domElementGetter,
      });

      return lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props))
        .then(() => {
          return expect(console.warn.mock.calls.length).toBe(0);
        });
    });

    it(`should log a warning`, () => {
      const props = { why: "hello" };
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: class rootComponent {},
        domElementGetter,
      });

      return lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props))
        .then(() => {
          return expect(console.warn.mock.calls.length).toBe(1);
        });
    });

    it(`should log a warning`, () => {
      const props = { why: "hello" };
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: function foo() {},
        domElementGetter,
      });

      return lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props))
        .then(() => {
          return expect(console.warn.mock.calls.length).toBe(1);
        });
    });

    it(`should not log a warning when errorBoundary opts is passed in`, () => {
      const props = { why: "hello", name: "hi" };
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: function foo() {},
        errorBoundary() {
          return null;
        },
      });

      return lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props))
        .then(() => {
          return expect(console.warn).not.toHaveBeenCalled();
        });
    });

    it(`should call opts.errorBoundary during an error boundary handler`, () => {
      const props = { why: "hello", name: "hi" };

      React.createElement = (type) => type;

      ReactDOM.render = (element, container, cb) => {
        element.prototype.setState = function (state) {
          this.state = state;
          this.render();
        };
        const el = new element(props);
        el.componentDidCatch(err, info);
        cb();
      };

      const opts = {
        React,
        ReactDOM,
        rootComponent: function foo() {},
        errorBoundary: jest.fn(),
      };
      const lifecycles = singleSpaReact(opts);

      let err = Error(),
        info = {};

      return lifecycles
        .bootstrap()
        .then(() => expect(opts.errorBoundary).not.toHaveBeenCalled())
        .then(() => lifecycles.mount(props))
        .then(() => expect(opts.errorBoundary).toHaveBeenCalled())
        .then(() => {
          return expect(console.warn).not.toHaveBeenCalled();
        });
    });
  });

  describe(`domElementGetter`, () => {
    it(`provides a default implementation of domElementGetter if you don't provide one`, () => {
      const props = { name: "k_ruel" };
      const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: function foo() {},
        // No domElementGetter
      });

      return lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props))
        .then(() => {
          expect(
            document.getElementById("single-spa-application:k_ruel")
          ).not.toBeFalsy();
        });
    });

    it(`passes props to the domElementGetter`, () => {
      const props = { name: "" };
      const opts = {
        React,
        ReactDOM,
        rootComponent: function Foo() {},
        domElementGetter: jest.fn(),
      };
      const lifecycles = singleSpaReact(opts);

      opts.domElementGetter.mockReturnValue(document.createElement("div"));

      return lifecycles
        .bootstrap()
        .then(() => lifecycles.mount(props))
        .then(() => {
          expect(opts.domElementGetter).toHaveBeenCalledWith(props);
        });
    });
  });
});
