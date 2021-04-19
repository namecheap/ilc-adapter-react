# ilc-adapter-react

Adapter for React applications that are registered as either ILC applications or ILC/single-spa parcels.

Implements pretty much the same functionality as [single-spa-react](https://github.com/single-spa/single-spa-react).
With the following differences:

- SSR optimized. Automatically decides whenever we need to use `ReactDOM.hydrate` or `ReactDOM.render`
- 100% typed, provides advanced Typescript types
- Provides complete [ILC](https://github.com/namecheap/ilc) integration out of the box. This includes: better error handling.
- Still, single-spa compatible.

## Examples of usage

**ILC application export:**

```tsx
import ilcAdapterReact, { AppLifecycleFnProps } from "ilc-adapter-react";
import Root from "./root.component";

const reactLifecycles = ilcAdapterReact<AppLifecycleFnProps>({
  rootComponent: Root,
});

export const bootstrap = reactLifecycles.bootstrap;
export const mount = reactLifecycles.mount;
export const unmount = reactLifecycles.unmount;
export const unload = reactLifecycles.unload;
```

**ILC Parcel export:**

```tsx
import ilcAdapterReact, {ParcelLifecycleFnProps} from 'ilc-adapter-react';

export const parcels = {
    person: ilcAdapterReact<ParcelLifecycleFnProps>({
        loadRootComponent: () => import('./person.parcel.js').then(property('default')),
    })
};

const reactLifecycles = /* ... */
export const bootstrap = reactLifecycles.bootstrap;
/* ... */
```

```tsx
// person.parcel.js
import React from "react";
import { ParcelLifecycleFnProps } from "ilc-adapter-react";

export default (props: ParcelLifecycleFnProps) => {
  return <div>Hello world</div>;
};
```

**ILC Parcel usage:**

```tsx
import { Parcel } from "ilc-adapter-react";

export default () => (
  <div>
    <Parcel
      loadingConfig={{ appName: "@portal/people", parcelName: "person" }}
      wrapWith="div"
      customParam1="testProp"
    />
  </div>
);
```
