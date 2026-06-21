import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas">
          <div className="text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={1.75} />
            </div>
            <h2 className="font-display font-bold text-xl text-ink mb-1.5">Something went wrong</h2>
            <p className="text-ink-muted text-[14px] mb-6">An unexpected error occurred. Refreshing usually fixes it.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-[13px] py-2.5 px-5"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
