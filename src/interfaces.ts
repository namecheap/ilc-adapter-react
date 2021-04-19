import type React from "react";
import type { ErrorInfo, ReactNode } from "react";
import type {
  AppLifecycleFnProps,
  AppWrapperLifecycleFnProps,
  ParcelLifecycleFnProps,
} from "ilc-sdk/app";

export type ReactComponent<T = IlcLifecycleFnProps> =
  | React.ComponentClass<T>
  | React.FC<T>;

interface AdapterOptsAux {
  // Optional opts
  parcelCanUpdate?: boolean;
  suppressComponentDidCatchWarning?: boolean;
  errorBoundary?: (
    err: Error,
    info: ErrorInfo | undefined,
    props: IlcLifecycleFnProps
  ) => ReactNode;
}

interface AdapterOptsSync<T> extends AdapterOptsAux {
  rootComponent: ReactComponent<T>;
}

interface AdapterOptsAsync<T> extends AdapterOptsAux {
  loadRootComponent: (props: T) => Promise<ReactComponent<T>>;
}

export type AdapterOpts<T = IlcLifecycleFnProps> =
  | AdapterOptsSync<T>
  | AdapterOptsAsync<T>;

export type IlcLifecycleFnProps =
  | AppLifecycleFnProps
  | ParcelLifecycleFnProps
  | AppWrapperLifecycleFnProps;
