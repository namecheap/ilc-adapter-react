import React, { ErrorInfo } from 'react';
import { createRoot, Root, hydrateRoot } from 'react-dom/client';
import { IlcAdapterError } from './errors';
import { AdapterOpts, IlcLifecycleFnProps, ReactComponent } from './interfaces';
import AdapterErrorBoundary from './AdapterErrorBoundary';
import { ErrorHandler, LifeCycles, MountParcel } from 'ilc-sdk/app';

interface ContextProps {
    mountParcel?: MountParcel;
}
// React context that gives any react component the single-spa props
export const SingleSpaContext = React.createContext<ContextProps>({});

export class IlcAdapterReact<LifecycleFnProps extends IlcLifecycleFnProps> implements LifeCycles<LifecycleFnProps> {
    private domElements: { [key: string]: HTMLElement | undefined } = {};
    private reactRoots: { [key: string]: Root | undefined } = {};
    private rootComponent?: ReactComponent<LifecycleFnProps>;
    private readonly userOpts: AdapterOpts<LifecycleFnProps>;

    constructor(userOpts: AdapterOpts<LifecycleFnProps>) {
        if (typeof userOpts !== 'object') {
            throw new Error(`ilc-adapter-react requires a configuration object`);
        }

        this.userOpts = {
            ...userOpts,
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
            throw new Error(`ilc-adapter-react: must be passed opts.rootComponent or opts.loadRootComponent`);
        }
    };

    mount = async (props: LifecycleFnProps) => {
        if (!this.rootComponent) {
            throw new IlcAdapterError(
                `ilc-adapter-react: Looks like "mount" was called before completion of the "bootstrap"`
            );
        }

        const domElement = this.chooseDomElementGetter(props)();
        if (!domElement) {
            throw new IlcAdapterError(
                `ilc-adapter-react: domElementGetter function for application '${props.name}' did not return a valid dom element. Please pass a valid domElement or domElementGetter via opts or props`
            );
        }

        const elementToRender = this.getElementToRender(this.rootComponent, props);

        const reactRoot = this.reactDomRender(elementToRender, domElement);

        this.reactRoots[props.name] = reactRoot;
        this.domElements[props.name] = domElement;

        return reactRoot;
    };

    unmount = async (props: Pick<LifecycleFnProps, 'name'>) => {
        const reactRoot = this.reactRoots[props.name];

        if (reactRoot) {
            reactRoot.unmount();
            delete this.reactRoots[props.name];
            delete this.domElements[props.name];
        }
    };

    update? = async (props: LifecycleFnProps) => {
        if (!this.rootComponent) {
            throw new IlcAdapterError(
                `ilc-adapter-react: Looks like "update" was called before completion of the "bootstrap"`
            );
        }

        const domElement = this.domElements[props.name];
        if (domElement === undefined) {
            throw new IlcAdapterError(
                `ilc-adapter-react: Looks like "update" was called before "mount" or after "unmount"`
            );
        }

        const elementToRender = this.getElementToRender(this.rootComponent, props);

        const reactRoot = this.reactDomRender(elementToRender, domElement, true);

        return reactRoot;
    };

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

        throw new IlcAdapterError(`ilc-adapter-react: Unable to identify DOM node to app/parcel mount`);
    }

    private getElementToRender(component: ReactComponent<LifecycleFnProps>, props: IlcLifecycleFnProps) {
        const rootComponentElement = React.createElement<any>(component, props); //TODO: remove "any"

        const errorBoundary = this.userOpts.errorBoundary
            ? (caughtError: Error, caughtErrorInfo?: ErrorInfo) =>
                  this.userOpts.errorBoundary!(caughtError, caughtErrorInfo, props)
            : undefined;

        const errorHandler: ErrorHandler = props.errorHandler
            ? props.errorHandler
            : (error) => {
                  console.error(
                      `ilc-adapter-react: app or parcel "${props.name}" have thrown an uncaught error:`,
                      error
                  );
              };

        return (
            <SingleSpaContext.Provider value={props}>
                <AdapterErrorBoundary onError={errorHandler} errorBoundary={errorBoundary}>
                    {rootComponentElement}
                </AdapterErrorBoundary>
            </SingleSpaContext.Provider>
        );
    }

    private reactDomRender(elementToRender: JSX.Element, domElement: Element, forceRender = false) {
        if (!forceRender && domElement.childElementCount > 0) {
            //We're likely rendering app after SSR
            return hydrateRoot(domElement, elementToRender);
        }

        // default to this if 'renderType' is null or doesn't match the other options
        const root = createRoot(domElement);
        root.render(elementToRender);

        return root;
    }
}

export default function ilcAdapterReact<T extends IlcLifecycleFnProps>(userOpts: AdapterOpts<T>) {
    return new IlcAdapterReact(userOpts);
}
