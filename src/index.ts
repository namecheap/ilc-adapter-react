import singleSpaReact from "./single-spa-react";
import ParcelImport from "./Parcel";

export {
  AppLifecycleFnProps,
  AppWrapperLifecycleFnProps,
  ParcelLifecycleFnProps,
  LifeCycles,
} from "ilc-sdk/app";

export const Parcel = ParcelImport;

export default singleSpaReact;
