import * as React from 'react';
import ilcAdapterReact from './ilc-adapter-react';
import '@testing-library/jest-dom/extend-expect';
import {
    AppLifecycleFnProps,
    AppWrapperLifecycleFnProps,
    MountParcel,
    ParcelLifecycleFnProps,
    ParcelSdk,
} from 'ilc-sdk/app';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function hasType<T>(v: T) {}

describe('ilc-adapter-react', () => {
    let root: HTMLElement;
    const ilcErrHandler = jest.fn();
    const appProps: AppLifecycleFnProps = Object.freeze({
        name: 'TEST_APP',
        appId: 'TEST_APP',
        appSdk: {
            appId: 'TEST_APP',
            intl: {} as any,
        },
        domElementGetter: () => root,
        getCurrentBasePath: () => '/',
        getCurrentPathProps: () => ({}),
        errorHandler: ilcErrHandler,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        mountParcel: ((() => {}) as unknown) as MountParcel,
    });
    const getParcelProps = function <T = unknown>(
        parcelId = 'TEST_PARCEL',
        domElement = root,
        registryProps?: T
    ): ParcelLifecycleFnProps<unknown, T> {
        return {
            parcelSdk: {
                parcelId,
                registryProps: registryProps || {},
                intl: {} as any,
            } as ParcelSdk<T>,
            domElement,
            name: parcelId,
            unmountSelf: () => Promise.resolve(null),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            mountParcel: ((() => {}) as unknown) as MountParcel,
        };
    };

    beforeEach(() => {
        root = document.createElement('div');
        document.body.append(root);
    });

    afterEach(() => {
        ilcErrHandler.mockClear();
        document.body.removeChild(root);
    });

    it('has correct constructor typings', () => {
        ilcAdapterReact<AppLifecycleFnProps>({
            rootComponent: (props) => {
                hasType<string>(props.appSdk.appId);
                return <div />;
            },
        });

        ilcAdapterReact<AppWrapperLifecycleFnProps>({
            rootComponent: (props) => {
                hasType<AppWrapperLifecycleFnProps['renderApp']>(props.renderApp);
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
                if ('appSdk' in props) {
                    hasType<() => HTMLElement>(props.domElementGetter);
                }
                return <div />;
            },
        });
    });

    it(`mounts and unmounts an APP, passing through the ILC props`, () => {
        const lifecycles = ilcAdapterReact<AppLifecycleFnProps>({
            rootComponent: (props: AppLifecycleFnProps) => <div>Hello world!</div>,
        });

        return lifecycles
            .bootstrap(appProps)
            .then(() => lifecycles.mount(appProps))
            .then(() => {
                expect(root.querySelector('div')?.textContent).toEqual('Hello world!');
                return lifecycles.unmount(appProps);
            })
            .then(() => {
                expect(root.childElementCount).toEqual(0);
            });
    });

    it(`mounts hydrates React component after SSR`, () => {
        const lifecycles = ilcAdapterReact({
            rootComponent: () => <div>Hello world!</div>,
        });

        const ssrMarkup = document.createElement('div');
        ssrMarkup.innerHTML = 'Hello world!';
        root.append(ssrMarkup);

        return lifecycles
            .bootstrap(appProps)
            .then(() => lifecycles.mount(appProps))
            .then(() => {
                expect(root.querySelector('div')).toBe(ssrMarkup);
                return lifecycles.unmount(appProps);
            })
            .then(() => {
                expect(root.childElementCount).toEqual(0);
            });
    });

    describe('Parcels', () => {
        it(`correctly handles two parcels using the same configuration`, () => {
            root.innerHTML = '<div id="parcel1"></div><div id="parcel2"></div>';
            const rootParcel1 = root.querySelector<HTMLElement>('#parcel1')!;
            const rootParcel2 = root.querySelector<HTMLElement>('#parcel2')!;

            const props1 = getParcelProps('PRCL1', rootParcel1);
            const props2 = getParcelProps('PRCL2', rootParcel2);
            const lifecycles = ilcAdapterReact<ParcelLifecycleFnProps>({
                rootComponent: (props) => <div>Hello from parcel: {props.parcelSdk.parcelId}</div>,
            });

            return lifecycles
                .bootstrap(props1)
                .then(() => lifecycles.mount(props1))
                .then(() => {
                    expect(rootParcel1.innerHTML).toContain('Hello from parcel: PRCL1');
                    expect(rootParcel2.innerHTML).toEqual('');
                })
                .then(() => lifecycles.bootstrap(props2))
                .then(() => lifecycles.mount(props2))
                .then(() => {
                    expect(rootParcel1.innerHTML).toContain('Hello from parcel: PRCL1');
                    expect(rootParcel2.innerHTML).toContain('Hello from parcel: PRCL2');
                })
                .then(() => lifecycles.unmount(props1))
                .then(() => {
                    expect(rootParcel1.innerHTML).toEqual('');
                    expect(rootParcel2.innerHTML).toContain('Hello from parcel: PRCL2');
                })
                .then(() => lifecycles.unmount(props2))
                .then(() => {
                    expect(rootParcel1.innerHTML).toEqual('');
                    expect(rootParcel2.innerHTML).toEqual('');
                });
        });

        it(`passes custom props to parcel`, async () => {
            const props = { ...getParcelProps(), custom: 'works' };

            const parcelConfig = ilcAdapterReact<ParcelLifecycleFnProps<{ custom: string }>>({
                rootComponent: (props) => <div>Custom prop: {props.custom}</div>,
            });

            await parcelConfig.bootstrap(props);
            await parcelConfig.mount(props);

            expect(root.innerHTML).toContain('Custom prop: works');

            await parcelConfig.unmount(props);
        });

        it(`passes custom registry props to parcel`, async () => {
            type RegProps = { custom: string };
            const props = getParcelProps<RegProps>(undefined, undefined, { custom: 'works' });

            const parcelConfig = ilcAdapterReact<ParcelLifecycleFnProps<unknown, RegProps>>({
                rootComponent: (props) => <div>Custom registry prop: {props.parcelSdk.registryProps.custom}</div>,
            });

            await parcelConfig.bootstrap(props);
            await parcelConfig.mount(props);

            expect(root.innerHTML).toContain('Custom registry prop: works');

            await parcelConfig.unmount(props);
        });
    });

    it(`doesn't throw an error if unmount is not called with a dom element or dom element getter`, () => {
        const lifecycles = ilcAdapterReact({
            rootComponent: () => <div>Hello world!</div>,
        });

        return lifecycles
            .bootstrap(appProps)
            .then(() => lifecycles.mount(appProps))
            .then(() => {
                expect(root.querySelector('div')?.textContent).toEqual('Hello world!');
                return lifecycles.unmount({ name: appProps.name });
            })
            .then(() => {
                expect(root.childElementCount).toEqual(0);
            });
    });

    describe('error boundaries', () => {
        it('handles render errors with default error boundary and reports errors to ILC', async () => {
            const err = new Error('test err');
            const lifecycles = ilcAdapterReact({
                rootComponent: () => {
                    throw err;
                },
            });

            await lifecycles.bootstrap(appProps);
            await lifecycles.mount(appProps);

            expect(ilcErrHandler.mock.calls.length).toBe(1);
            expect(ilcErrHandler.mock.calls[0][0]).toBe(err);
            expect(root.innerHTML).toContain('Something went wrong. Please try to reload the page.');

            await lifecycles.unmount(appProps);
        });

        it('handles render errors with provided errorBoundary', async () => {
            const err = new Error('test err');
            const lifecycles = ilcAdapterReact({
                rootComponent: () => {
                    throw err;
                },
                errorBoundary(err, errInfo, props) {
                    return <div>Caught error: {err.message}</div>;
                },
            });

            await lifecycles.bootstrap(appProps);
            await lifecycles.mount(appProps);

            expect(root.innerHTML).toContain('Caught error: test err');

            await lifecycles.unmount(appProps);
        });
    });
});
