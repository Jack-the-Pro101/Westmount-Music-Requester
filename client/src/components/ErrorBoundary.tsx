import { ComponentChildren } from "preact";
import { useErrorBoundary } from "preact/hooks";

const ErrorBoundary = ({ children }: { children: ComponentChildren }) => {
    const [error] = useErrorBoundary();

    if (!error) return <>{children}</>;

    const reload = () => location.reload();

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100vw",
            textAlign: "center",
        }}>
            <h1>Something went wrong</h1>
            <p>Unfortunately, the app unexpectedly crashed. Try reloading the page; if this doesn't work, try clearing your cookies.</p>
            <button onClick={reload}>Reload</button>
        </div>
    )
};

export default ErrorBoundary;
