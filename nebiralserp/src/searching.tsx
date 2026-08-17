import React, { useEffect, useRef, useState } from "react";
import "./searching.css";

interface AnalysisResult {
    id: number;
    url: string;
    title?: string;
    meta_description?: string;
    meta_keywords?: string;
    h1?: string;
}

const Searching: React.FC = () => {
    const [url, setUrl] = useState("");
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [loading, setLoading] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://127.0.0.1:8000/ws/analyze/");

        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log("WebSocket data:", data);

            if (data.type === "analysis_result") {
                setResults((prev) => [
                    data.result,
                    ...prev,
                ]);

                setLoading(false);
            }

            if (data.type === "analysis_error") {
                console.error(data.message);
                setLoading(false);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            setLoading(false);
        };

        socket.onclose = () => {
            console.log("WebSocket disconnected");
        };

        return () => {
            socket.close();
        };
    }, []);

    const handleSearch = () => {
        if (!url.trim()) return;

        if (
            !socketRef.current ||
            socketRef.current.readyState !== WebSocket.OPEN
        ) {
            console.error("WebSocket is not connected");
            return;
        }

        setLoading(true);

        socketRef.current.send(
            JSON.stringify({
                type: "analyze",
                url: url.trim(),
            })
        );

        setUrl("");
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <main className="searching-page">

            <div className="searching-container">

                <div className="searching-header">
                    <h1>SEO AI</h1>

                    <p>
                        Analyze your website and discover SEO opportunities
                    </p>
                </div>

                <div className="search-box">

                    <input
                        type="url"
                        value={url}
                        onChange={(event) =>
                            setUrl(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="https://example.com"
                    />

                    <button
                        onClick={handleSearch}
                        disabled={loading || !url.trim()}
                    >
                        {loading ? "Analyzing..." : "Analyze"}
                    </button>

                </div>

                <div className="results">

                    {results.map((result) => (
                        <div
                            className="result-card"
                            key={result.id}
                        >
                            <div className="result-top">
                                <h2>
                                    {result.title || "Untitled page"}
                                </h2>

                                <span>
                                    {result.url}
                                </span>
                            </div>

                            <div className="result-info">

                                <div>
                                    <strong>Meta Description</strong>

                                    <p>
                                        {result.meta_description ||
                                            "No meta description"}
                                    </p>
                                </div>

                                <div>
                                    <strong>Meta Keywords</strong>

                                    <p>
                                        {result.meta_keywords ||
                                            "No meta keywords"}
                                    </p>
                                </div>

                                <div>
                                    <strong>H1</strong>

                                    <p>
                                        {result.h1 ||
                                            "No H1 found"}
                                    </p>
                                </div>

                            </div>
                        </div>
                    ))}

                </div>

            </div>

        </main>
    );
};

export default Searching;