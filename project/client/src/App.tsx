import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { AdminPage } from "./pages/AdminPage";
import { ClientPage } from "./pages/ClientPage";

function App() {
  const path = window.location.pathname.toLowerCase();
  const isAdmin = path === "/admin";
  return <ConfigProvider locale={zhCN}>{isAdmin ? <AdminPage /> : <ClientPage />}</ConfigProvider>;
}

export default App;
