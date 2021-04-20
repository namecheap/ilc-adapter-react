import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { ErrorHandler } from 'ilc-sdk/app';

interface ErrorState {
    caughtError?: Error;
    caughtErrorInfo?: ErrorInfo;
}

interface Props {
    onError: ErrorHandler;
    errorBoundary?: (error: Error, errorInfo?: ErrorInfo) => ReactNode;
}

export default class AdapterErrorBoundary extends React.Component<Props, ErrorState> {
    constructor(props: Props) {
        super(props);

        this.state = {};
    }

    // This method is called at SSR, while componentDidCatch used only at CSR
    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return {
            caughtError: error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            caughtError: error,
            caughtErrorInfo: errorInfo,
        });

        this.props.onError(error, {
            errorInfo: errorInfo.componentStack,
        });
    }

    render() {
        if (this.state.caughtError) {
            if (this.props.errorBoundary) {
                return this.props.errorBoundary(this.state.caughtError, this.state.caughtErrorInfo);
            }

            return <h1>Something went wrong. Please try to reload the page.</h1>;
        }

        return this.props.children;
    }
}
