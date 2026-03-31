import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-onair-red/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-onair-red" />
          </div>
          <h2 className="text-lg font-display font-bold text-onair-text mb-2">
            Oops, quelque chose a planté
          </h2>
          <p className="text-sm text-onair-muted mb-6">
            Une erreur inattendue s'est produite. Recharge la page pour continuer.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recharger
          </button>
        </div>
      </div>
    );
  }
}
