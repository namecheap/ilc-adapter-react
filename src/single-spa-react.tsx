import React, {ErrorInfo} from 'react';
import ReactDOM from 'react-dom';
import {AdapterOpts, IlcLifecycleFnProps, ReactComponent} from './interfaces';
import AdapterErrorBoundary from './AdapterErrorBoundary';
import {
    AppLifecycleFnProps,
    AppWrapperLifecycleFnProps,
    ErrorHandler,
    LifeCycles, MountParcel, ParcelLifecycleFnProps,
} from 'ilc-sdk/app';

interface ContextProps {
    mountParcel?: MountParcel;
}
// React context that gives any react component the single-spa props
export let SingleSpaContext = React.createContext<ContextProps>({});


export class SingleSpaReact<LifecycleFnProps extends IlcLifecycleFnProps> {
    private domElements: {[key: string]: HTMLElement} = {};
    private rootComponent?: ReactComponent<LifecycleFnProps>;
    private readonly userOpts: AdapterOpts<LifecycleFnProps>;

    constructor(userOpts: AdapterOpts<LifecycleFnProps>) {
        if (typeof userOpts !== 'object') {
            throw new Error(`ilc-adapter-react requires a configuration object`);
        }

        this.userOpts = {...userOpts,
            parcelCanUpdate: true, // by default, allow parcels created with single-spa-react to be updated
        };

        if (this.userOpts.parcelCanUpdate === false) {
            this.update = undefined;
        }
    }

    bootstrap = async (props: LifecycleFnProps) => {
        if ('rootComponent' in this.userOpts) {
            // This is a class or stateless function component
            this.rootComponent = this.userOpts.rootComponent;
        } else if (this.userOpts.loadRootComponent) {
            // They passed a promise that resolves with the react component. Wait for it to resolve before mounting
            this.rootComponent = await this.userOpts.loadRootComponent(props);
        } else if (!this.rootComponent) {
            throw new Error(
                `ilc-adapter-react: must be passed opts.rootComponent or opts.loadRootComponent`
            );
        }
    }

    mount = async (props: LifecycleFnProps) => {
        if (!this.rootComponent) {
            throw new Error(`ilc-adapter-react: Looks like "mount" was called before completion of the "bootstrap"`);
        }

        const domElement = this.chooseDomElementGetter(props)();
        if (!domElement) {
            throw new Error(
                `ilc-adapter-react: domElementGetter function for application '${props.name}' did not return a valid dom element. Please pass a valid domElement or domElementGetter via opts or props`
            );
        }

        const elementToRender = this.getElementToRender(props);

        this.reactDomRender(
            elementToRender,
            domElement,
        );

        this.domElements[props.name] = domElement;
    }

    unmount = async (props: LifecycleFnProps) => {
        ReactDOM.unmountComponentAtNode(this.domElements[props.name]);
        delete this.domElements[props.name];
    }

    update? = async (props: LifecycleFnProps) => {
        const elementToRender = this.getElementToRender(props);

        this.reactDomRender(
            elementToRender,
            this.domElements[props.name],
            true
        );
    }

    private chooseDomElementGetter(props: IlcLifecycleFnProps) {
        if ('domElement' in props) {
            return () => props.domElement;
        } else if (props.domElementGetter) {
            if (typeof props.domElementGetter !== 'function') {
                throw new Error(
                    `ilc-adapter-react: the domElementGetter for react application '${props.name}' is not a function`
                );
            }

            return props.domElementGetter;
        }

        throw Error(
            `ilc-adapter-react: Unable to identify DOM node to app/parcel mount`
        );
    }

    private getElementToRender(props: IlcLifecycleFnProps) {
        const rootComponentElement = React.createElement<any>( //TODO: remove "any"
            this.rootComponent!, //TODO: remove !
            props
        );

        const errorBoundary = this.userOpts.errorBoundary
            ? (caughtError: Error, caughtErrorInfo?: ErrorInfo) => this.userOpts.errorBoundary!(caughtError, caughtErrorInfo, props)
            : undefined;

        const errorHandler: ErrorHandler = props.errorHandler ? props.errorHandler : (error) => {
            console.error(`ilc-adapter-react: app or parcel "${props.name}" have thrown an uncaught error:`, error);
        };

        return (
            <SingleSpaContext.Provider value={props}>
                <AdapterErrorBoundary onError={errorHandler} errorBoundary={errorBoundary}>
                    {rootComponentElement}
                </AdapterErrorBoundary>
            </SingleSpaContext.Provider>
        );
    }

    private reactDomRender(
        elementToRender: JSX.Element,
        domElement: Element,
        forceRender = false
    ) {
        if (!forceRender && domElement.childElementCount > 0) { //We're likely rendering app after SSR
            return ReactDOM.hydrate(elementToRender, domElement);
        }

        // default to this if 'renderType' is null or doesn't match the other options
        return ReactDOM.render(elementToRender, domElement);
    }
}

export default function ilcAdapterReact<T extends IlcLifecycleFnProps>(userOpts: AdapterOpts<T>): LifeCycles<T> {
    return new SingleSpaReact(userOpts);
}

const zApp = ilcAdapterReact<AppLifecycleFnProps>({
    rootComponent: props => {
        const a = props.appSdk.appId;
        return <div/>;
    },
});
const zWrapper = ilcAdapterReact<AppWrapperLifecycleFnProps>({
    rootComponent: props => {
        const a = props.renderApp({});
        return <div/>;
    },
});
const zParcel = ilcAdapterReact<ParcelLifecycleFnProps>({
    rootComponent: props => {
        const a = props.parcelSdk.parcelId;
        return <div/>;
    },
});
const zGuard = ilcAdapterReact({
    rootComponent: props => {
        if ('appSdk' in props) {
            props.domElementGetter();
        }
        return <div/>;
    },
});
const zAppAsync = ilcAdapterReact<AppLifecycleFnProps>({
    loadRootComponent: () => import('./tstComp').then(v => v.default)
});