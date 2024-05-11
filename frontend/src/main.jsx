import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import  {SocketContextProvider}  from "./context/socketContext.jsx";

//disable refetching the react query request on window change passing the following option
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SocketContextProvider>
          <App />
        </SocketContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
