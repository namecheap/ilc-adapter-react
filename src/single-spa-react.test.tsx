import React from "react";
import ilcAdapterReact from "./single-spa-react";
import "@testing-library/jest-dom/extend-expect";
import {
  AppLifecycleFnProps,
  AppWrapperLifecycleFnProps,
  MountParcel,
  ParcelLifecycleFnProps,
} from "ilc-sdk/app";

function hasType<T>(a: T) {}

describe("ilc-adapter-react", () => {
  let root: HTMLElement;
  const appProps: AppLifecycleFnProps = Object.freeze({
    name: "TEST_APP",
    appId: "TEST_APP",
    appSdk: {
      appId: "TEST_APP",
      intl: {} as any,
    },
    domElementGetter: () => root,
    getCurrentBasePath: () => "/",
    getCurrentPathProps: () => ({}),
    errorHandler: () => {},
    mountParcel: ((() => {}) as unknown) as MountParcel,
  });

  beforeEach(() => {
    root = document.createElement("div");
    document.body.append(root);
  });

  afterEach(() => {
    document.body.removeChild(root);
  });

  it("has correct constructor typings", () => {
    ilcAdapterReact<AppLifecycleFnProps>({
      rootComponent: (props) => {
        hasType<string>(props.appSdk.appId);
        return <div />;
      },
    });

    ilcAdapterReact<AppWrapperLifecycleFnProps>({
      rootComponent: (props) => {
        hasType<AppWrapperLifecycleFnProps["renderApp"]>(props.renderApp);
        return <div />;
      },
    });

    ilcAdapterReact<ParcelLifecycleFnProps>({
      rootComponent: (props) => {
        hasType<string>(props.parcelSdk.parcelId);
        return <div />;
      },
    });

    ilcAdapterReact({
      rootComponent: (props) => {
        if ("appSdk" in props) {
          hasType<() => HTMLElement>(props.domElementGetter);
        }
        return <div />;
      },
    });
  });

  it(`mounts and unmounts an APP, passing through the ILC props`, () => {
    const lifecycles = ilcAdapterReact({
      rootComponent: () => <div>Hello world!</div>,
    });

    return lifecycles
      .bootstrap(appProps)
      .then(() => lifecycles.mount(appProps))
      .then(() => {
        expect(root.querySelector("div")?.textContent).toEqual("Hello world!");
        return lifecycles.unmount(appProps);
      })
      .then(() => {
        expect(root.childElementCount).toEqual(0);
      });
  });

  // it(`mounts and unmounts a React component with a 'renderType' of 'hydrate'`, () => {
  //   const props = { why: "hello" };
  //   const lifecycles = ilcAdapterReact({
  //     React,
  //     ReactDOM,
  //     rootComponent,
  //     domElementGetter,
  //     renderType: "hydrate",
  //   });
  //
  //   return lifecycles
  //     .bootstrap()
  //     .then(() => lifecycles.mount(props))
  //     .then(() => {
  //       expect(React.createElement).toHaveBeenCalled();
  //       expect(React.createElement.mock.calls[0][0]).toEqual(rootComponent);
  //       expect(React.createElement.mock.calls[0][1]).toEqual(props);
  //       expect(ReactDOM.hydrate).toHaveBeenCalled();
  //       expect(ReactDOM.hydrate.mock.calls[0][0]).toEqual(createdReactElement);
  //       expect(ReactDOM.hydrate.mock.calls[0][1]).toEqual(domElement);
  //       expect(typeof ReactDOM.hydrate.mock.calls[0][2]).toEqual("function");
  //       return lifecycles.unmount(props);
  //     })
  //     .then(() => {
  //       expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(
  //         domElement
  //       );
  //     });
  // });
  //
  // it(`chooses the parcel dom element over other dom element getters`, () => {
  //   const optsDomElementGetter = () => "optsDomElementGetter";
  //   let opts = {
  //     React,
  //     ReactDOM,
  //     rootComponent,
  //     domElementGetter: optsDomElementGetter,
  //   };
  //   let propsDomElementGetter = () => "propsDomElementGetter";
  //   let propsDomElement = () => "propsDomElement";
  //   let props = {
  //     domElement: propsDomElement,
  //     domElementGetter: propsDomElementGetter,
  //   };
  //
  //   const lifecycles = ilcAdapterReact(opts);
  //
  //   return lifecycles
  //     .bootstrap()
  //     .then(() => lifecycles.mount(props))
  //     .then(() => lifecycles.unmount(props))
  //     .then(() => {
  //       expect(ReactDOM.render).toHaveBeenCalled();
  //       // prefer customProp dom element over everything because it's how parcels work
  //       expect(ReactDOM.render.mock.calls[0][1]).toBe(propsDomElement);
  //     });
  // });
  //
  // it(`correctly handles two parcels using the same configuration`, () => {
  //   let opts = { React, ReactDOM, rootComponent };
  //
  //   let props1 = { domElement: "element1" };
  //   let props2 = { domElement: "element2" };
  //   const lifecycles = ilcAdapterReact(opts);
  //
  //   return (
  //     lifecycles
  //       .bootstrap()
  //       .then(() => lifecycles.mount(props1))
  //       .then(() => lifecycles.unmount(props1))
  //       .then(() => {
  //         expect(ReactDOM.render).toHaveBeenCalled();
  //         expect(ReactDOM.render.mock.calls.length).toBe(1);
  //         expect(ReactDOM.render.mock.calls[0][1]).toBe("element1");
  //         expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalled();
  //         expect(ReactDOM.unmountComponentAtNode.mock.calls.length).toBe(1);
  //         expect(ReactDOM.unmountComponentAtNode.mock.calls[0][0]).toBe(
  //           "element1"
  //         );
  //       })
  //       // simulate another parcel using the same configuration
  //       .then(() => lifecycles.bootstrap())
  //       .then(() => lifecycles.mount(props2))
  //       .then(() => lifecycles.unmount(props2))
  //       .then(() => {
  //         expect(ReactDOM.render.mock.calls.length).toBe(2);
  //         expect(ReactDOM.render.mock.calls[1][1]).toBe("element2");
  //         expect(ReactDOM.unmountComponentAtNode.mock.calls.length).toBe(2);
  //         expect(ReactDOM.unmountComponentAtNode.mock.calls[1][0]).toBe(
  //           "element2"
  //         );
  //       })
  //   );
  // });
  //
  // it(`allows you to provide a domElementGetter as a prop`, () => {
  //   const props = { why: "hello", domElementGetter };
  //   const lifecycles = ilcAdapterReact({ React, ReactDOM, rootComponent });
  //
  //   return lifecycles.bootstrap().then(() => lifecycles.mount(props));
  //   // Doesn't throw
  // });
  //
  //
  // it(`doesn't throw an error if unmount is not called with a dom element or dom element getter`, () => {
  //   const opts = { React, ReactDOM, rootComponent };
  //   const props = { domElementGetter };
  //
  //   const lifecycles = ilcAdapterReact(opts);
  //
  //   return lifecycles
  //     .bootstrap()
  //     .then(() => lifecycles.mount(props))
  //     .then(() => {
  //       expect(domElementGetter).toHaveBeenCalledTimes(1);
  //
  //       // The domElementGetter should no longer be required after mount is finished
  //       delete props.domElementGetter;
  //     })
  //     .then(() => lifecycles.unmount(props))
  //     .then(() => expect(domElementGetter).toHaveBeenCalledTimes(1));
  // });
  //
  //
  // // https://github.com/single-spa/single-spa/issues/604
  // it(`does not throw an error if a customProps prop is provided`, async () => {
  //   const parcelConfig = ilcAdapterReact({
  //     React,
  //     ReactDOM,
  //     rootComponent,
  //   });
  //   const normalProps = { foo: "bar", name: "app1" };
  //   await parcelConfig.bootstrap(normalProps);
  //   await parcelConfig.mount(normalProps);
  //
  //   const unusualProps = { name: "app2", customProps: { foo: "bar" } };
  //   await parcelConfig.bootstrap(unusualProps);
  //   await parcelConfig.mount(unusualProps);
  // });
  //
  // describe("error boundaries", () => {
  //   let originalWarn;
  //   beforeEach(() => {
  //     originalWarn = console.warn;
  //     console.warn = jest.fn();
  //   });
  //
  //   afterEach(() => {
  //     console.warn = originalWarn;
  //   });
  //
  //   it(`should not log a warning`, () => {
  //     const props = { why: "hello" };
  //     const lifecycles = ilcAdapterReact({
  //       React,
  //       ReactDOM,
  //       rootComponent: class rootComponent {
  //         componentDidCatch() {}
  //       },
  //       domElementGetter,
  //     });
  //
  //     return lifecycles
  //       .bootstrap()
  //       .then(() => lifecycles.mount(props))
  //       .then(() => {
  //         return expect(console.warn.mock.calls.length).toBe(0);
  //       });
  //   });
  //
  //   it(`should log a warning`, () => {
  //     const props = { why: "hello" };
  //     const lifecycles = ilcAdapterReact({
  //       React,
  //       ReactDOM,
  //       rootComponent: class rootComponent {},
  //       domElementGetter,
  //     });
  //
  //     return lifecycles
  //       .bootstrap()
  //       .then(() => lifecycles.mount(props))
  //       .then(() => {
  //         return expect(console.warn.mock.calls.length).toBe(1);
  //       });
  //   });
  //
  //   it(`should log a warning`, () => {
  //     const props = { why: "hello" };
  //     const lifecycles = ilcAdapterReact({
  //       React,
  //       ReactDOM,
  //       rootComponent: function foo() {},
  //       domElementGetter,
  //     });
  //
  //     return lifecycles
  //       .bootstrap()
  //       .then(() => lifecycles.mount(props))
  //       .then(() => {
  //         return expect(console.warn.mock.calls.length).toBe(1);
  //       });
  //   });
  //
  //   it(`should not log a warning when errorBoundary opts is passed in`, () => {
  //     const props = { why: "hello", name: "hi" };
  //     const lifecycles = ilcAdapterReact({
  //       React,
  //       ReactDOM,
  //       rootComponent: function foo() {},
  //       errorBoundary() {
  //         return null;
  //       },
  //     });
  //
  //     return lifecycles
  //       .bootstrap()
  //       .then(() => lifecycles.mount(props))
  //       .then(() => {
  //         return expect(console.warn).not.toHaveBeenCalled();
  //       });
  //   });
  //
  //   it(`should call opts.errorBoundary during an error boundary handler`, () => {
  //     const props = { why: "hello", name: "hi" };
  //
  //     React.createElement = (type) => type;
  //
  //     ReactDOM.render = (element, container, cb) => {
  //       element.prototype.setState = function (state) {
  //         this.state = state;
  //         this.render();
  //       };
  //       const el = new element(props);
  //       el.componentDidCatch(err, info);
  //       cb();
  //     };
  //
  //     const opts = {
  //       React,
  //       ReactDOM,
  //       rootComponent: function foo() {},
  //       errorBoundary: jest.fn(),
  //     };
  //     const lifecycles = ilcAdapterReact(opts);
  //
  //     let err = Error(),
  //       info = {};
  //
  //     return lifecycles
  //       .bootstrap()
  //       .then(() => expect(opts.errorBoundary).not.toHaveBeenCalled())
  //       .then(() => lifecycles.mount(props))
  //       .then(() => expect(opts.errorBoundary).toHaveBeenCalled())
  //       .then(() => {
  //         return expect(console.warn).not.toHaveBeenCalled();
  //       });
  //   });
  // });
  //
  // describe(`domElementGetter`, () => {
  //   it(`provides a default implementation of domElementGetter if you don't provide one`, () => {
  //     const props = { name: "k_ruel" };
  //     const lifecycles = ilcAdapterReact({
  //       React,
  //       ReactDOM,
  //       rootComponent: function foo() {},
  //       // No domElementGetter
  //     });
  //
  //     return lifecycles
  //       .bootstrap()
  //       .then(() => lifecycles.mount(props))
  //       .then(() => {
  //         expect(
  //           document.getElementById("single-spa-application:k_ruel")
  //         ).not.toBeFalsy();
  //       });
  //   });
  //
  //   it(`passes props to the domElementGetter`, () => {
  //     const props = { name: "" };
  //     const opts = {
  //       React,
  //       ReactDOM,
  //       rootComponent: function Foo() {},
  //       domElementGetter: jest.fn(),
  //     };
  //     const lifecycles = ilcAdapterReact(opts);
  //
  //     opts.domElementGetter.mockReturnValue(document.createElement("div"));
  //
  //     return lifecycles
  //       .bootstrap()
  //       .then(() => lifecycles.mount(props))
  //       .then(() => {
  //         expect(opts.domElementGetter).toHaveBeenCalledWith(props);
  //       });
  //   });
  // });
});
