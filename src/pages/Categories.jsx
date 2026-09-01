import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Header,
  Panel,
} from "../components/UI";

import {
  categoryApi,
} from "../services/api";


export default function Categories() {

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================================
  // LOAD
  // =========================================================

  const loadCategories = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await categoryApi.list();

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

      setCategories(data);

    } catch (err) {

      console.error(
        "CATEGORY LIST ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load categories."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadCategories();

  }, []);


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    category
  ) => {

    const confirmed =
      window.confirm(
        `Delete "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await categoryApi.remove(
        category.id
      );

      setCategories(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              category.id
          )
      );

    } catch (err) {

      console.error(
        "CATEGORY DELETE ERROR:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.detail ||
        "Unable to delete category."
      );

    }
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>

      <Header
        title="Categories"
        desc="Organize products into store categories."
      >

        <Link
          className="btn"
          to="/admin/categories/new"
        >
          ＋ Add Category
        </Link>

      </Header>


      <Panel>

        {loading && (
          <div className="empty-state">
            Loading categories...
          </div>
        )}


        {!loading &&
          error && (
            <div className="empty-state">
              {error}
            </div>
          )}


        {!loading &&
          !error &&
          categories.length === 0 && (
            <div className="empty-state">
              No categories found.
            </div>
          )}


        {!loading &&
          !error &&
          categories.length > 0 && (

          <table>

            <thead>

              <tr>

                <th>
                  Category
                </th>

                <th>
                  Parent
                </th>

                <th>
                  Slug
                </th>

                <th>
                  Status
                </th>

                <th>
                  Featured
                </th>

                <th />

              </tr>

            </thead>


            <tbody>

              {categories.map(
                (category) => (

                  <tr
                    key={
                      category.id
                    }
                  >

                    <td>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                        }}
                      >

                        {category.image ? (

                          <img
                            src={
                              category.image
                            }
                            alt={
                              category.name
                            }
                            style={{
                              width:
                                "42px",
                              height:
                                "42px",
                              borderRadius:
                                "7px",
                              objectFit:
                                "cover",
                            }}
                          />

                        ) : (

                          <div
                            style={{
                              width:
                                "42px",
                              height:
                                "42px",
                              borderRadius:
                                "7px",
                              background:
                                "#f1f1f1",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >
                            —
                          </div>

                        )}

                        <b>
                          {
                            category.name
                          }
                        </b>

                      </div>

                    </td>


                    <td>

                      {category.parent
                        ? category.parent
                        : "—"}

                    </td>


                    <td>

                      {category.slug ||
                        "—"}

                    </td>


                    <td>

                      <span
                        style={{
                          color:
                            category.is_active
                              ? "#16803c"
                              : "#999",
                          fontWeight:
                            "600",
                        }}
                      >
                        {category.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>


                    <td>

                      {category.is_featured
                        ? "★"
                        : "—"}

                    </td>


                    <td>

                      <Link
                        className="action"
                        to={`/admin/categories/${category.id}/edit`}
                      >
                        ✎
                      </Link>


                      <button
                        type="button"
                        className="action"
                        onClick={() =>
                          handleDelete(
                            category
                          )
                        }
                        style={{
                          marginLeft:
                            "6px",
                          border:
                            "none",
                          cursor:
                            "pointer",
                        }}
                      >
                        🗑
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </Panel>

    </>
  );
}