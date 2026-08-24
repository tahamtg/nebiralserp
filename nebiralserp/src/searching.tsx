import React, { useEffect, useRef, useState } from "react";
import "./searching.css";

interface Keyword {
    keyword: string;
    count: number;
}

interface AnalysisResult {
    id: number;
    url: string;
    status: number;
    title?: string;
    description?: string;
    keywords?: Keyword[];
    alt?: string[];
}

type StatusType = "red" | "orange" | "green";

interface SEOCheck {
    label: string;
    status: StatusType;
    message: string;
}

const Searching: React.FC = () => {
    const [url, setUrl] = useState("");
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [loading, setLoading] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(
            "wss://nebiral.ir/ws/analyze/"
        );

        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                console.log("WebSocket data:", data);

                if (data.type === "pages") {
                    setResults(data.data);
                }

                if (data.type === "crawl_finished") {
                    console.log(
                        "Crawler finished:",
                        data.url
                    );

                    setLoading(false);
                }

            } catch (error) {
                console.error(
                    "WebSocket data error:",
                    error
                );
            }
        };

        socket.onerror = (error) => {
            console.error(
                "WebSocket error:",
                error
            );

            setLoading(false);
        };

        socket.onclose = (event) => {
            console.log(
                "WebSocket disconnected"
            );

            console.log(
                "Close code:",
                event.code
            );

            console.log(
                "Close reason:",
                event.reason
            );
        };

        return () => {
            socket.close();
        };
    }, []);

    const analyzeTitle = (
        title?: string
    ): SEOCheck => {
        const value = title?.trim() || "";

        if (!value) {
            return {
                label: "Title",
                status: "red",
                message: "Title وجود ندارد",
            };
        }

        if (value.length < 30) {
            return {
                label: "Title",
                status: "orange",
                message: `Title کوتاه است (${value.length} کاراکتر)`,
            };
        }

        if (value.length > 60) {
            return {
                label: "Title",
                status: "orange",
                message: `Title طولانی است (${value.length} کاراکتر)`,
            };
        }

        return {
            label: "Title",
            status: "green",
            message: `Title مناسب است (${value.length} کاراکتر)`,
        };
    };

    const analyzeDescription = (
        description?: string
    ): SEOCheck => {
        const value =
            description?.trim() || "";

        if (!value) {
            return {
                label: "Meta Description",
                status: "red",
                message: "Meta Description وجود ندارد",
            };
        }

        if (value.length < 120) {
            return {
                label: "Meta Description",
                status: "orange",
                message: `Meta Description کوتاه است (${value.length} کاراکتر)`,
            };
        }

        if (value.length > 160) {
            return {
                label: "Meta Description",
                status: "orange",
                message: `Meta Description طولانی است (${value.length} کاراکتر)`,
            };
        }

        return {
            label: "Meta Description",
            status: "green",
            message: `Meta Description مناسب است (${value.length} کاراکتر)`,
        };
    };

    const analyzeAlt = (
        alt?: string[]
    ): SEOCheck => {
        const images = alt || [];

        if (images.length === 0) {
            return {
                label: "Image Alt",
                status: "orange",
                message: "تصویری در صفحه پیدا نشد",
            };
        }

        const missingAlt = images.filter(
            item => !item?.trim()
        ).length;

        if (missingAlt === images.length) {
            return {
                label: "Image Alt",
                status: "red",
                message: "تمام تصاویر فاقد Alt هستند",
            };
        }

        if (missingAlt > 0) {
            return {
                label: "Image Alt",
                status: "orange",
                message: `${missingAlt} تصویر فاقد Alt است`,
            };
        }

        return {
            label: "Image Alt",
            status: "green",
            message: `تمام ${images.length} تصویر دارای Alt هستند`,
        };
    };

    const analyzeKeywords = (
        keywords?: Keyword[]
    ): SEOCheck => {
        const items = keywords || [];

        if (items.length === 0) {
            return {
                label: "Keywords",
                status: "red",
                message: "Keyword مناسبی پیدا نشد",
            };
        }

        if (items.length < 3) {
            return {
                label: "Keywords",
                status: "orange",
                message: `تعداد کمی Keyword پیدا شد (${items.length})`,
            };
        }

        return {
            label: "Keywords",
            status: "green",
            message: `${items.length} Keyword پیدا شد`,
        };
    };

    const analyzePage = (
        result: AnalysisResult
    ): SEOCheck[] => {
        return [
            analyzeTitle(result.title),
            analyzeDescription(result.description),
            analyzeAlt(result.alt),
            analyzeKeywords(result.keywords),
        ];
    };

    const handleSearch = () => {
        if (!url.trim()) {
            return;
        }

        if (
            !socketRef.current ||
            socketRef.current.readyState !== WebSocket.OPEN
        ) {
            console.error(
                "WebSocket is not connected"
            );

            return;
        }

        setLoading(true);
        setResults([]);

        socketRef.current.send(
            JSON.stringify({
                type: "start_crawl",
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
                        disabled={loading}
                    />

                    <button
                        onClick={handleSearch}
                        disabled={
                            loading ||
                            !url.trim()
                        }
                    >
                        {loading
                            ? "Crawling..."
                            : "Analyze"}
                    </button>

                </div>

                {loading && (
                    <div className="crawler-loading">

                        <div className="spinner"></div>

                        <p>
                            در حال بررسی سایت...
                        </p>

                        <span>
                            لطفاً تا پایان فرآیند Crawl صبر کنید
                        </span>

                    </div>
                )}

                <div className="results">

                    {results.map((result) => {

                        const checks =
                            analyzePage(result);

                        return (
                            <div
                                className="result-card"
                                key={result.id}
                            >

                                <div className="result-top">

                                    <h2>
                                        {result.title ||
                                            "Untitled page"}
                                    </h2>

                                    <span>
                                        {result.url}
                                    </span>

                                </div>

                                <div className="result-info">

                                    <div>
                                        <strong>
                                            Status
                                        </strong>

                                        <p>
                                            {result.status}
                                        </p>
                                    </div>

                                    {checks.map(
                                        (check) => (
                                            <div
                                                key={check.label}
                                                className={`seo-check ${check.status}`}
                                            >
                                                <div className="seo-check-title">

                                                    <span
                                                        className={`seo-dot ${check.status}`}
                                                    />

                                                    <strong>
                                                        {check.label}
                                                    </strong>

                                                </div>

                                                <p>
                                                    {check.message}
                                                </p>

                                            </div>
                                        )
                                    )}

                                    <div>
                                        <strong>
                                            Keywords
                                        </strong>

                                        {result.keywords?.map(
                                            (
                                                keyword,
                                                index
                                            ) => (
                                                <p
                                                    key={index}
                                                >
                                                    {
                                                        keyword.keyword
                                                    }{" "}
                                                    (
                                                    {
                                                        keyword.count
                                                    }
                                                    )
                                                </p>
                                            )
                                        )}

                                    </div>

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

        </main>
    );
};

export default Searching;