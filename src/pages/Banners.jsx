import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Header,
  Panel,
} from "../components/UI";

import { bannerApi } from "../services/api";


export default function Banners() {

  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================================================
  // LOAD BANNERS
  // =========================================================

  const loadBanners = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await bannerApi.list();

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

      setBanners(data);

    } catch (err) {

      console.error(
        "BANNER LIST ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load banners."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadBanners();
  }, []);


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (banner) => {

    const confirmed =
      window.confirm(
        `Delete "${banner.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await bannerApi.remove(
        banner.id
      );

      setBanners(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== banner.id
          )
      );

    } catch (err) {

      console.error(
        "BANNER DELETE ERROR:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.detail ||
        "Unable to delete banner."
      );

    }
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>

      <Header
        title="Banners"
        desc="Manage promotional banners displayed across your store."
      >

        <Link
          className="btn"
          to="/admin/banners/new"
        >
          ＋ Add Banner
        </Link>

      </Header>


      <Panel>

        {loading && (

          <div className="empty">
            Loading banners...
          </div>

        )}


        {!loading &&
          error && (

          <div className="empty">
            {error}
          </div>

        )}


        {!loading &&
          !error &&
          banners.length === 0 && (

          <div className="empty">
            No banners found.
          </div>

        )}


        {!loading &&
          !error &&
          banners.length > 0 && (

          <table>

            <thead>

              <tr>

                <th>
                  Banner
                </th>

                <th>
                  Button
                </th>

                <th>
                  Order
                </th>

                <th>
                  Status
                </th>

                <th />

              </tr>

            </thead>


            <tbody>

              {banners.map(
                (banner) => (

                <tr
                  key={banner.id}
                >

                  {/* =========================================
                      BANNER
                  ========================================= */}

                  <td>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >

                      {banner.image ? (

                        <img
                          src={banner.image}
                          alt={banner.title}
                          style={{
                            width: "105px",
                            height: "52px",
                            borderRadius: "7px",
                            objectFit: "cover",
                            border:
                              "1px solid #e5e7eb",
                          }}
                        />

                      ) : (

                        <div
                          style={{
                            width: "105px",
                            height: "52px",
                            borderRadius: "7px",
                            background: "#f3f4f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9ca3af",
                          }}
                        >
                          No image
                        </div>

                      )}


                      <div>

                        <b>
                          {banner.title}
                        </b>

                        {banner.subtitle && (

                          <small
                            style={{
                              display: "block",
                              marginTop: "3px",
                              color: "#8a93a1",
                              maxWidth: "300px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {banner.subtitle}
                          </small>

                        )}

                      </div>

                    </div>

                  </td>


                  {/* =========================================
                      BUTTON
                  ========================================= */}

                  <td>

                    {banner.button_text
                      ? banner.button_text
                      : "—"}

                  </td>


                  {/* =========================================
                      ORDER
                  ========================================= */}

                  <td>

                    {banner.display_order ??
                      "—"}

                  </td>


                  {/* =========================================
                      STATUS
                  ========================================= */}

                  <td>

                    <span
                      style={{
                        color:
                          banner.is_active
                            ? "#16803c"
                            : "#999",
                        fontWeight: "600",
                      }}
                    >
                      {banner.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>


                  {/* =========================================
                      ACTIONS
                  ========================================= */}

                  <td>

                    <Link
                      className="action"
                      to={`/admin/banners/${banner.id}/edit`}
                    >
                      ✎
                    </Link>


                    <button
                      type="button"
                      className="action"
                      onClick={() =>
                        handleDelete(
                          banner
                        )
                      }
                      style={{
                        marginLeft: "6px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      🗑
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </Panel>

    </>
  );
}