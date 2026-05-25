import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./Popup.scss";

const SELF_ID = chrome.runtime.id;
const DEFAULT_ICON = chrome.runtime.getURL("icons/default.png");

interface ExtInfo {
    id: string;
    name: string;
    enabled: boolean;
    mayDisable: boolean;
    iconUrl: string;
}

function getIconUrl(ext: chrome.management.ExtensionInfo): string {
    const icons = ext.icons;
    if (!icons || icons.length === 0) return DEFAULT_ICON;
    const match = icons.find((i) => i.size === 32) ?? icons[icons.length - 1];
    return match.url || DEFAULT_ICON;
}

function Popup() {
    const [extensions, setExtensions] = useState<ExtInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        chrome.management.getAll().then((list) => {
            const mapped: ExtInfo[] = list
                .filter((ext) => ext.id !== SELF_ID)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((ext) => ({
                    id: ext.id,
                    name: ext.name,
                    enabled: ext.enabled,
                    mayDisable: ext.mayDisable,
                    iconUrl: getIconUrl(ext),
                }));
            setExtensions(mapped);
            setLoading(false);
        });
    }, []);

    const toggle = (ext: ExtInfo) => {
        if (!ext.mayDisable) return;
        chrome.management.setEnabled(ext.id, !ext.enabled);
        setExtensions((prev) =>
            prev.map((e) =>
                e.id === ext.id ? { ...e, enabled: !e.enabled } : e
            )
        );
    };

    const filtered = extensions.filter((ext) =>
        ext.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="popup">
            <input
                className="search-bar"
                type="text"
                placeholder="搜索扩展……"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {loading ? (
                <div className="status">加载中……</div>
            ) : filtered.length === 0 ? (
                <div className="status">无结果</div>
            ) : (
                <div className="grid">
                    {filtered.map((ext) => (
                        <div
                            key={ext.id}
                            className={`ext-item${ext.enabled ? "" : " disabled"}${ext.mayDisable ? "" : " locked"}`}
                            title={ext.name}
                            onClick={() => toggle(ext)}
                        >
                            <img
                                className="ext-icon"
                                src={ext.iconUrl}
                                alt={ext.name}
                            />
                            <span className="ext-name">{ext.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<Popup />);
