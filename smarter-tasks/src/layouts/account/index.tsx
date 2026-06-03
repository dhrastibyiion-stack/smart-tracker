import { Outlet } from "react-router-dom";

import Header from "../../components/Header";
import "../../site.css";

const AccountLayout = () => {
  return (
    <div className="site">
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AccountLayout;

