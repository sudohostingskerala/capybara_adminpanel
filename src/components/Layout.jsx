import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

const links = [
  ["MAIN"],
  ["Dashboard", "/admin", "▦"],

  ["STORE"],
  ["Products", "/admin/products", "▣"],
  ["Categories", "/admin/categories", "◇"],
  ["Orders", "/admin/orders", "🛒"],
  ["Inventory", "/admin/inventory", "▤"],

  ["CONTENT"],
  ["Banners", "/admin/banners", "▧"],
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  // =========================================================
  // CURRENT ADMIN
  // =========================================================

  const storedUser =
    localStorage.getItem("admin_user");

  let adminUser = null;

  try {
    adminUser = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    adminUser = null;
  }

  const adminName =
    adminUser?.first_name ||
    adminUser?.email ||
    "Administrator";

  const adminEmail =
    adminUser?.email ||
    "Administrator";

  const adminInitial =
    (
      adminUser?.first_name ||
      adminUser?.email ||
      "A"
    )
      .charAt(0)
      .toUpperCase();

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    localStorage.removeItem(
      "admin_user"
    );

    setOpen(false);

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <div className="shell">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={
          "side " + (open ? "open" : "")
        }
      >

        {/* Brand */}

        <div className="brand">

          <b>🐹</b>

          <div>
            <strong>
              Capybara
            </strong>

            <small>
              Admin Panel
            </small>
          </div>

        </div>


        {/* Logged-in user */}

        <div className="user">

          <i>
            {adminInitial}
          </i>

          <div>

            <strong>
              {adminName}
            </strong>

            <small>
              Store Administrator
            </small>

          </div>

        </div>


        {/* Navigation */}

        <nav>

          {links.map((item, index) =>
            item.length === 1 ? (

              <label key={index}>
                {item[0]}
              </label>

            ) : (

              <NavLink
                key={item[0]}
                to={item[1]}
                end={
                  item[0] === "Dashboard"
                }
                onClick={() =>
                  setOpen(false)
                }
              >

                <span>
                  {item[2]}
                </span>

                {item[0]}

              </NavLink>

            )
          )}

        </nav>


        {/* Logout */}

        <button
          type="button"
          className="logout"
          onClick={logout}
        >
          ↪ Logout
        </button>

      </aside>


      {/* =====================================================
          MAIN AREA
          ===================================================== */}

      <div className="main">

        {/* Header */}

        <header>

          {/* Mobile menu */}

          <button
            type="button"
            className="hamb"
            onClick={() =>
              setOpen((value) => !value)
            }
          >
            ☰
          </button>


          {/* Search */}

          <div className="search">

            ⌕

            <input
              type="search"
              placeholder="Search anything..."
            />

          </div>


          {/* Right side */}

          <div className="right">

            {/* Notification */}

            <span>
              🔔
            </span>

            <i>
              3
            </i>


            {/* Avatar */}

            <div className="avatar">
              {adminInitial}
            </div>


            {/* Admin information */}

            <div>

              <strong>
                {adminName}
              </strong>

              <small>
                {adminEmail}
              </small>

            </div>

          </div>

        </header>


        {/* Page content */}

        <main>
          <Outlet />
        </main>

      </div>

    </div>
  );
}