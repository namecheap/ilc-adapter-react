import * as React from 'react';
import Parcel from './parcel';
import { render, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ilcAdapterReact, { SingleSpaContext } from './ilc-adapter-react';

describe(`<Parcel />`, () => {
    let config: any, parcel: any, props: any;
    const mountParcel = jest.fn();

    beforeEach(() => {
        config = {
            bootstrap: jest.fn(),
            mount: jest.fn(),
            unmount: jest.fn(),
        };

        parcel = {
            loadPromise: jest.fn(),
            bootstrapPromise: jest.fn(),
            mountPromise: Promise.resolve(),
            unmountPromise: jest.fn(),
            getStatus: jest.fn(),
            unmount: jest.fn(),
            update: jest.fn(),
        };

        mountParcel.mockReset();
        mountParcel.mockReturnValue(parcel);

        props = { mountParcel, loadingFn: () => Promise.resolve(config) };
    });

    it(`renders a div by default`, () => {
        expect(document.querySelector('div')).not.toBeInTheDocument();
        const wrapper = render(<Parcel {...props} />);
        expect(document.querySelector('div')).toBeInTheDocument();
    });

    it(`renders a div wrap with style`, () => {
        const wrapper = render(<Parcel {...props} wrapStyle={{ height: '100px' }} />);
        expect(document.querySelector<HTMLElement>(`div[style]`)?.style.height).toEqual('100px');
    });

    it(`renders a div wrap with className`, () => {
        const wrapper = render(<Parcel {...props} wrapClassName="wrapper" />);
        expect(document.querySelector('div.wrapper')).toBeInTheDocument();
    });

    it(`calls the mountParcel prop when it mounts`, async () => {
        const wrapper = render(<Parcel {...props} />);
        await waitFor(() => expect(mountParcel).toHaveBeenCalled());
    });

    it(`renders inside the append to`, async () => {
        const appendTo = document.body.appendChild(document.createElement('section'));
        expect(document.querySelector('section div')).not.toBeInTheDocument();
        const wrapper = render(<Parcel {...props} appendTo={appendTo} />);
        await waitFor(() => expect(document.querySelector('section div')).toBeInTheDocument());
    });

    it(`calls parcelDidMount prop when the parcel finishes mounting`, async () => {
        const parcelDidMount = jest.fn();
        const wrapper = render(<Parcel {...props} parcelDidMount={parcelDidMount} />);

        expect(parcelDidMount).not.toHaveBeenCalled();

        await waitFor(() => expect(parcelDidMount).toHaveBeenCalled());
    });

    // eslint-disable-next-line jest/no-done-callback
    it(`doesn't update the parcel a second or third time until previous parcel updates complete`, (done) => {
        const wrapper = render(<Parcel {...props} />);

        let numParcelUpdateCalls = 0;
        let firstParcelUpdateFinished = false;
        let secondParcelUpdateFinished = false;

        parcel.update.mockImplementation(() => {
            switch (++numParcelUpdateCalls) {
                case 1:
                    return firstParcelUpdate();
                case 2:
                    return secondParcelUpdate();
                case 3:
                    return thirdParcelUpdate();
                default:
                    done.fail('Parcel update should only be called thrice');
                    break;
            }
        });

        function firstParcelUpdate() {
            return new Promise<void>((resolve) => {
                /* Don't resolve this promise for a while to make sure that the second update
                 * Doesn't start until the first finishes
                 */
                setTimeout(() => {
                    firstParcelUpdateFinished = true;
                    resolve();
                }, 100);
            });
        }

        function secondParcelUpdate() {
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(firstParcelUpdateFinished).toBe(true);
                    secondParcelUpdateFinished = true;
                    resolve();
                }, 100);
            });
        }

        function thirdParcelUpdate() {
            return Promise.resolve().then(() => {
                expect(firstParcelUpdateFinished).toBe(true);
                expect(secondParcelUpdateFinished).toBe(true);
                done();
            });
        }

        function triggerComponentDidUpdate() {
            wrapper.rerender(<Parcel {...props} />);
        }

        // not once
        triggerComponentDidUpdate();

        // not twice
        triggerComponentDidUpdate();

        // but thrice!
        triggerComponentDidUpdate();
    });

    it(`calls mountParcel with all the React props`, async () => {
        const wrapper = render(<Parcel {...props} />);
        // We need to wait for a microtask to finish before the Parcel component will have called mountParcel
        await waitFor(() => expect(mountParcel).toHaveBeenCalled());
        const parcelProps = mountParcel.mock.calls[0][1];
        expect(parcelProps.domElement).toBeInstanceOf(HTMLDivElement);
    });

    it(`lets you not pass in a mountParcel prop if the SingleSpaContext is set with one`, async () => {
        // this creates the SingleSpaContext
        const appLifecycles = ilcAdapterReact({
            rootComponent() {
                return null;
            },
        });

        const wrapper = render(
            <SingleSpaContext.Provider value={{ mountParcel }}>
                <Parcel loadingFn={() => Promise.resolve(config)} />
            </SingleSpaContext.Provider>
        );

        await waitFor(() => expect(mountParcel).toHaveBeenCalled());
    });
});
