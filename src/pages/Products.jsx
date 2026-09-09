import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Header,
  Panel,
} from "../components/UI";

import {
  productAdminApi,
  categoryApi,
} from "../services/api";


export default function Products() {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [categories, setCategories] =
  useState([]);

  const [categoriesLoading, setCategoriesLoading] =
  useState(true);  


  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await productAdminApi.list();

      console.log(
        "PRODUCTS FROM BACKEND:",
        response.data
      );


      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];


      setProducts(data);

    } catch (error) {

      console.error(
        "PRODUCT LIST ERROR:",
        error.response?.data ||
          error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load products."
      );

    } finally {

      setLoading(false);

    }
  };

   //========================================================
   //Load categories
   //========================================================
   const loadCategories = async () => {
  try {
    setCategoriesLoading(true);

    const response =
      await categoryApi.list();

    const data =
      Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

    setCategories(data);

  } catch (error) {
    console.error(
      "CATEGORY LIST ERROR:",
      error.response?.data || error
    );

  } finally {
    setCategoriesLoading(false);
  }
};   

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
  loadProducts();
  loadCategories();
}, []);


  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDelete = async (
    product
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(
        product.id
      );


      await productAdminApi.remove(
        product.id
      );


      // Remove immediately from UI
      setProducts(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              product.id
          )
      );


    } catch (error) {

      console.error(
        "PRODUCT DELETE ERROR:",
        error.response?.data ||
          error
      );


      alert(
        error.response?.data?.detail ||
        "Unable to delete product."
      );

    } finally {

      setDeletingId(null);

    }
  };


  // =========================================================
  // SEARCH
  // =========================================================

  const filteredProducts =
    products.filter(
      (product) => {

        const searchText =
          search
            .trim()
            .toLowerCase();

        if (!searchText) {
          return true;
        }


        const name =
          String(
            product.name || ""
          ).toLowerCase();


        const slug =
          String(
            product.slug || ""
          ).toLowerCase();


        const keywords =
          String(
            product.search_keywords ||
              ""
          ).toLowerCase();


        return (
          name.includes(
            searchText
          ) ||
          slug.includes(
            searchText
          ) ||
          keywords.includes(
            searchText
          )
        );
      }
    );


  // =========================================================
  // PRODUCT HELPERS
  // =========================================================

  const getFirstVariant = (
    product
  ) => {

    return (
      product.variants?.[0] ||
      product.product_variants?.[0] ||
      null
    );
  };


  const getSku = (
    product
  ) => {

    const variant =
      getFirstVariant(
        product
      );

    return (
      product.sku ||
      variant?.sku ||
      "—"
    );
  };


  const getPrice = (
    product
  ) => {

    const variant =
      getFirstVariant(
        product
      );

    return (
      product.price ??
      variant?.price ??
      null
    );
  };


  const getStock = (
    product
  ) => {

    const variant =
      getFirstVariant(
        product
      );

    // If backend provides product-level
    // stock, use it.

    if (
      product.stock !==
      undefined &&
      product.stock !== null
    ) {
      return product.stock;
    }


    // Otherwise calculate stock
    // from all variants.

    const variants =
      product.variants ||
      product.product_variants ||
      [];


    if (
      variants.length > 0
    ) {

      return variants.reduce(
        (
          total,
          variant
        ) =>
          total +
          Number(
            variant.stock || 0
          ),
        0
      );

    }


    return (
      variant?.stock ??
      null
    );
  };


  const getCategory = (product) => {

  // Backend already returned category object
  if (
    product.category &&
    typeof product.category === "object"
  ) {
    return (
      product.category.name ||
      "—"
    );
  }


  // Backend returned category ID
  const categoryId =
    product.category;


  if (
    categoryId !== undefined &&
    categoryId !== null
  ) {

    const category =
      categories.find(
        (item) =>
          String(item.id) ===
          String(categoryId)
      );


    if (category) {
      return category.name;
    }
  }


  // Fallback
  return (
    product.category_name ||
    "—"
  );
};


  const getImage = (
    product
  ) => {

    return (
      product.primary_image ||
      product.image ||
      product.thumbnail ||
      product.colors?.[0]
        ?.images?.[0]
        ?.image ||
      null
    );
  };


  const getStatus = (
    product
  ) => {

    if (
      product.is_active ===
      false
    ) {
      return "Inactive";
    }

    return "Active";
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>

      <Header
        title="Products"
        desc="Manage your store products and variants."
      >

        <Link
          className="btn"
          to="/admin/products/new"
        >
          + Add Product
        </Link>

      </Header>


      <Panel>

        {/* ===================================================
            TOOLBAR
            =================================================== */}

        <div className="productToolbar">

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search products..."
            style={{
              maxWidth: "360px",
              width: "100%",
            }}
          />


          <button
            type="button"
            className="btn"
            onClick={
              loadProducts
            }
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

        </div>


        {/* ===================================================
            LOADING
            =================================================== */}

        {loading && (

          <div className="empty-state">
            Loading products...
          </div>

        )}


        {/* ===================================================
            ERROR
            =================================================== */}

        {!loading &&
          error && (

          <div className="empty-state">

            <p>
              {error}
            </p>

            <button
              type="button"
              className="btn"
              onClick={
                loadProducts
              }
            >
              Try Again
            </button>

          </div>

        )}


        {/* ===================================================
            EMPTY
            =================================================== */}

        {!loading &&
          !error &&
          filteredProducts.length ===
            0 && (

          <div className="empty-state">

            {search
              ? "No products match your search."
              : "No products found."}

          </div>

        )}


        {/* ===================================================
            TABLE
            =================================================== */}

        {!loading &&
          !error &&
          filteredProducts.length >
            0 && (

          <div
            style={{
              overflowX:
                "auto",
            }}
          >

            <table>

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
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

                {filteredProducts.map(
                  (product) => {

                    const image =
                      getImage(
                        product
                      );

                    const sku =
                      getSku(
                        product
                      );

                    const price =
                      getPrice(
                        product
                      );

                    const stock =
                      getStock(
                        product
                      );

                    const category =
                      getCategory(
                        product
                      );

                    const status =
                      getStatus(
                        product
                      );


                    return (

                      <tr
                        key={
                          product.id
                        }
                      >

                        {/* PRODUCT */}

                        <td>

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "12px",
                            }}
                          >

                            {image ? (

                              <img
                                src={
                                  image
                                }
                                alt={
                                  product.name
                                }
                                style={{
                                  width:
                                    "48px",
                                  height:
                                    "48px",
                                  objectFit:
                                    "cover",
                                  borderRadius:
                                    "8px",
                                }}
                              />

                            ) : (

                              <div
                                style={{
                                  width:
                                    "48px",
                                  height:
                                    "48px",
                                  borderRadius:
                                    "8px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  background:
                                    "#f1f1f1",
                                  fontSize:
                                    "18px",
                                }}
                              >
                                📦
                              </div>

                            )}


                            <div>

                              <b>
                                {
                                  product.name
                                }
                              </b>

                              {product.slug && (

                                <small
                                  style={{
                                    display:
                                      "block",
                                    opacity:
                                      0.6,
                                    marginTop:
                                      "3px",
                                  }}
                                >
                                  {
                                    product.slug
                                  }
                                </small>

                              )}

                            </div>

                          </div>

                        </td>


                        {/* SKU */}

                        <td>
                          {sku}
                        </td>


                        {/* CATEGORY */}

                        <td>
                          {category}
                        </td>


                        {/* PRICE */}

                        <td>

                          {price !==
                            null &&
                          price !==
                            undefined
                            ? `₹${price}`
                            : "—"}

                        </td>


                        {/* STOCK */}

                        <td>

                          {stock !==
                            null &&
                          stock !==
                            undefined
                            ? stock
                            : "—"}

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              status ===
                              "Active"
                                ? "status active"
                                : "status inactive"
                            }
                          >
                            {status}
                          </span>

                        </td>


                        {/* FEATURED */}

                        <td>

                          {product.is_featured
                            ? "★"
                            : "—"}

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "8px",
                            }}
                          >

                            <Link
                              className="action"
                              to={`/admin/products/${product.id}/edit`}
                              title="Edit product"
                            >
                              ✎
                            </Link>


                            <button
                              type="button"
                              className="action"
                              title="Delete product"
                              disabled={
                                deletingId ===
                                product.id
                              }
                              onClick={() =>
                                handleDelete(
                                  product
                                )
                              }
                            >
                              {deletingId ===
                              product.id
                                ? "..."
                                : "🗑"}
                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </Panel>

    </>
  );
}