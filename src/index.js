
//import dependencies
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

//get the root element of the website and render the website components
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
