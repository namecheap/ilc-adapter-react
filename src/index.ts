import IlcSdk, { AppAssets } from 'ilc-sdk';
import ilcAdapterReact from './ilc-adapter-react';

export type {
    AppLifecycleFnProps,
    AppWrapperLifecycleFnProps,
    ParcelLifecycleFnProps,
    LifeCycles,
    Render404,
    ErrorHandler,
    IIlcAppSdk,
    AppSdkAdapter
} from 'ilc-sdk/app';

export { IlcSdk, AppAssets };

export default ilcAdapterReact;
