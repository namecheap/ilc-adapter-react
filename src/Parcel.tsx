import React from 'react';
import {SingleSpaContext} from './single-spa-react';

import type {
    LifeCycles,
    ParcelObject,
    ParcelLifecycleFnProps,
    MountParcel
} from 'ilc-sdk/app';
import {ParcelError} from './errors';
import {GlobalBrowserApi} from 'ilc-sdk/app';



interface ParcelProps {
    loadingFn: () => Promise<LifeCycles<ParcelLifecycleFnProps>>;
    loadingConfig: {
        appName: string;
        parcelName: string;
    };

    mountParcel?: MountParcel;
    wrapWith?: string;
    wrapStyle?: React.CSSProperties;
    wrapClassName?: string;
    appendTo?: HTMLElement;
    parcelDidMount?: () => any;
    handleError?: (err: Error, errorInfo?: Record<string, unknown>) => any;

    [extraProp: string]: any;
}

interface State {
    hasError: boolean;
}

export default class Parcel extends React.Component<ParcelProps, State> {
    private el?: HTMLElement;
    private createdDomElement?: HTMLElement;
    private mountParcel?: MountParcel;
    private parcel?: ParcelObject;
    private unmounted = false;
    private activePromiseChain?: Promise<any>;

    constructor(props: ParcelProps) {
        super(props);

        this.state = {
            hasError: false,
        };

        if (!props.loadingConfig && !props.loadingFn) {
            throw new Error(
                `ilc-adapter-react: Parcel component requires the 'loadingConfig' or 'loadingFn' prop to either be passed.`
            );
        }
    }

    componentDidMount() {
        this.schedulePromise('mount', () => {
            const mountParcel = this.props.mountParcel || this.mountParcel;
            if (!mountParcel) {
                throw new Error(`
				  <Parcel /> was not passed a mountParcel prop, nor is it rendered where mountParcel is within the React context.
				  If you are using <Parcel /> within a module that is not a single-spa application, you will need to import mountRootParcel from single-spa and pass it into <Parcel /> as a mountParcel prop
				`);
            }

            let domElement: HTMLElement;
            if (this.el) {
                domElement = this.el;
            } else if (this.props.appendTo) {
                this.createdDomElement = domElement = document.createElement(this.getWrapWith());
                const wrapStyle = this.getWrapStyle();
                Object.keys(wrapStyle).forEach((key) => {
                    domElement.style[key] = wrapStyle[key];
                });
                this.props.appendTo.appendChild(domElement);
            } else {
                throw new ParcelError('Unexpected scenario!'); //TODO: better wording
            }

            const loadingFn = this.props.loadingFn ? this.props.loadingFn
                : () => GlobalBrowserApi.importParcelFromApp(this.props.loadingConfig.appName, this.props.loadingConfig.parcelName);

            this.parcel = mountParcel(loadingFn, {
                domElement,
                errorHandler: this.handleError,
                ...this.getParcelProps(),
            });

            if (this.props.parcelDidMount) {
                this.parcel.mountPromise.then(this.props.parcelDidMount);
            }

            return this.parcel.mountPromise;
        });
    }

    componentDidUpdate() {
        this.schedulePromise('update', () => {
            if (this.parcel && this.parcel.update) {
                return this.parcel.update(this.getParcelProps());
            }
        });
    }

    componentWillUnmount() {
        this.schedulePromise('unmount', () => {
            if (this.parcel && this.parcel.getStatus() === 'MOUNTED') {
                return this.parcel.unmount();
            }
        });

        if (this.createdDomElement && this.createdDomElement.parentNode) {
            this.createdDomElement.parentNode.removeChild(this.createdDomElement);
        }

        this.unmounted = true;
    }

    render() {
        // In case when "appendTo" prop passed - we render nothing within app DOM tree
        // We only fetch necessary info from context
        if (this.props.appendTo) {
            if (SingleSpaContext && SingleSpaContext.Consumer) {
                return (
                    <SingleSpaContext.Consumer>
                        {(context) => {
                            this.mountParcel = context ? context.mountParcel : undefined;

                            return null;
                        }}
                    </SingleSpaContext.Consumer>
                );
            } else {
                return null;
            }
        } else {
            const children =
                SingleSpaContext && SingleSpaContext.Consumer ? (
                    <SingleSpaContext.Consumer>
                        {(context) => {
                            this.mountParcel = context ? context.mountParcel : undefined;

                            return null;
                        }}
                    </SingleSpaContext.Consumer>
                ) : undefined;

            return React.createElement(
                this.getWrapWith(),
                {
                    ref: this.handleRef,
                    style: this.props.wrapStyle,
                    className: this.props.wrapClassName,
                },
                children
            );
        }
    }

    private getWrapWith() {
        return this.props.wrapWith || 'div';
    }

    private getWrapStyle() {
        return this.props.wrapStyle || {};
    }

    handleRef = (el: HTMLElement) => {
        this.el = el;
    };

    private schedulePromise(action: 'unmount' | 'mount' | 'update', promise: () => Promise<any> | void) {
        if (this.state.hasError && action !== "unmount") {
            // In an error state, we don't do anything anymore except for unmounting
            return;
        }

        this.activePromiseChain = (this.activePromiseChain || Promise.resolve())
            .then(() => {
                if (this.unmounted && action !== 'unmount') {
                    // Never do anything once the react component unmounts
                    return;
                }

                return promise();
            }).catch((error) => {
                this.activePromiseChain = Promise.resolve(); // reset so we don't .then() the bad promise again

                const err = new ParcelError(`While executing "${action}": ${error.message}`, error);
                this.handleError(err);

                // No more things to do should be done -- the EmbeddedApplication is in an error state
            });
    };

    private handleError = (error: Error, errorInfo?: Record<string, unknown>) => {
        if (!this.isUnmounted()) {
            this.setState({hasError: true});
        }

        let err: ParcelError;
        if (error instanceof ParcelError) {
            err = error;
        } else {
            err = new ParcelError(`Parcel threw an error: ${error.message}`, error);
        }

        if (this.props.handleError) {
            this.props.handleError(err, errorInfo);
        } else if (!this.isUnmounted()) {
            // We transform error into regular React error
            // https://medium.com/trabe/catching-asynchronous-errors-in-react-using-error-boundaries-5e8a5fd7b971
            this.setState(() => {
                throw err;
            });
        }
    };

    private isUnmounted() {
        return !this.el;
    }

    private getParcelProps() {
        const parcelProps: any = {...this.props};

        delete parcelProps.mountParcel;
        delete parcelProps.config;
        delete parcelProps.wrapWith;
        delete parcelProps.wrapStyle;
        delete parcelProps.appendTo;
        delete parcelProps.handleError;
        delete parcelProps.parcelDidMount;

        return parcelProps;
    };
}
