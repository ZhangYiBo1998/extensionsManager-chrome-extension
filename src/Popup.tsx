// 引入所需的库和组件
import React, {useState} from "react";
import ReactDOM from "react-dom/client";
import './Popup.scss';

// 定义PopupProps接口
interface PopupProps {
}

// 定义弹出窗口组件
function Popup(props: PopupProps) {

    return (
        <div>
            empty-chrome-extension
        </div>
    );
}

// 加载配置并渲染弹出窗口
chrome.storage.local.get([], (props: {[key: string]: any}) => {
    ReactDOM.createRoot(document.body).render(<Popup {...props} />);
});