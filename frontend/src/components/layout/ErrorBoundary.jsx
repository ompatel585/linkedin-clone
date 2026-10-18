import { Component } from "react";

class ErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error("Unhandled UI error:", error, info.componentStack);
    }

    render() {
        if (!this.state.error) return this.props.children;
        return (
            <div className="min-h-dvh grid place-items-center p-6">
                <div className="card-surface p-8 max-w-md text-center space-y-4">
                    <h1 className="text-xl font-semibold">Something went wrong</h1>
                    <p className="text-muted">An unexpected error occurred. Reloading usually fixes it.</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Reload page
                    </button>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
