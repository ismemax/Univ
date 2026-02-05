
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-red-100 text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.27 0 2.09-1.383 1.43-2.405L13.43 5.395c-.63-1.022-2.106-1.022-2.73 0L3.502 16.595c-.63 1.022.19 2.405 1.43 2.405z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">Something went wrong</h1>
                        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                            An unexpected error occurred in the application. Please try refreshing the page.
                        </p>
                        <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left overflow-auto max-h-32">
                            <code className="text-[10px] text-red-400 font-mono break-all">{this.state.error?.toString()}</code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-umak-blue text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            Refresh Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
