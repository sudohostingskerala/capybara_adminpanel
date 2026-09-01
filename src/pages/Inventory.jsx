import { useEffect, useMemo, useState } from "react";

import {
  Header,
  Panel,
} from "../components/UI";

import { inventoryApi } from "../services/api";


export default function Inventory() {

  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [editingId, setEditingId] = useState(null);

  const [stockValue, setStockValue] = useState("");

  const [saving, setSaving] = useState(false);


  // =========================================================
  // LOAD INVENTORY
  // =========================================================

  const loadInventory = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await inventoryApi.list();

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

      setInventory(data);

    } catch (err) {

      console.error(
        "INVENTORY LOAD ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load inventory."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadInventory();

  }, []);


  // =========================================================
  // INVENTORY COUNTS
  // =========================================================

  const counts = useMemo(() => {

    const total = inventory.length;

    const inStock = inventory.filter(
      (item) =>
        Number(item.stock) > 5
    ).length;

    const lowStock = inventory.filter(
      (item) =>
        Number(item.stock) > 0 &&
        Number(item.stock) <= 5
    ).length;

    const outOfStock = inventory.filter(
      (item) =>
        Number(item.stock) <= 0
    ).length;

    return {
      total,
      inStock,
      lowStock,
      outOfStock,
    };

  }, [inventory]);


  // =========================================================
  // FILTER + SEARCH
  // =========================================================

  const filteredInventory =
    useMemo(() => {

      const query =
        search.trim().toLowerCase();

      return inventory.filter(
        (item) => {

          // -----------------------------------------------
          // SEARCH
          // -----------------------------------------------

          const matchesSearch =
            !query ||
            item.product_name
              ?.toLowerCase()
              .includes(query) ||
            item.sku
              ?.toLowerCase()
              .includes(query) ||
            item.color_name
              ?.toLowerCase()
              .includes(query) ||
            item.size_name
              ?.toLowerCase()
              .includes(query);


          if (!matchesSearch) {
            return false;
          }


          // -----------------------------------------------
          // FILTER
          // -----------------------------------------------

          const stock =
            Number(item.stock || 0);


          if (filter === "IN_STOCK") {

            return stock > 5;

          }


          if (filter === "LOW_STOCK") {

            return (
              stock > 0 &&
              stock <= 5
            );

          }


          if (filter === "OUT_OF_STOCK") {

            return stock <= 0;

          }


          return true;

        }
      );

    }, [
      inventory,
      search,
      filter,
    ]);


  // =========================================================
  // START EDIT
  // =========================================================

  const startEditing = (item) => {

    setEditingId(item.id);

    setStockValue(
      String(item.stock ?? 0)
    );

  };


  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const cancelEditing = () => {

    setEditingId(null);

    setStockValue("");

  };


  // =========================================================
  // SAVE STOCK
  // =========================================================

  const saveStock = async (id) => {

    const value =
      Number(stockValue);


    if (
      stockValue === "" ||
      !Number.isInteger(value) ||
      value < 0
    ) {

      setError(
        "Stock must be a whole number greater than or equal to 0."
      );

      return;

    }


    try {

      setSaving(true);
      setError("");

      const response =
        await inventoryApi.update(
          id,
          {
            stock: value,
          }
        );


      // -----------------------------------------------------
      // UPDATE LOCAL STATE
      // -----------------------------------------------------

      setInventory(
        (current) =>
          current.map(
            (item) =>
              item.id === id
                ? response.data
                : item
          )
      );


      cancelEditing();

    } catch (err) {

      console.error(
        "INVENTORY UPDATE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.stock?.[0] ||
        "Unable to update stock."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // STATUS
  // =========================================================

  const getStatus = (item) => {

    const stock =
      Number(item.stock || 0);


    if (stock <= 0) {

      return {
        label: "Out of Stock",
        className:
          "inventory-status out",
      };

    }


    if (stock <= 5) {

      return {
        label: "Low Stock",
        className:
          "inventory-status low",
      };

    }


    return {
      label: "In Stock",
      className:
        "inventory-status in",
    };

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>

      <Header
        title="Inventory"
        desc="Monitor and manage product stock levels."
      />


      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="stats four">

        <div className="mini">

          <div className="inventory-mini-icon">
            📦
          </div>

          <div>

            <small>
              Total SKUs
            </small>

            <b>
              {counts.total}
            </b>

          </div>

        </div>


        <div className="mini">

          <div className="inventory-mini-icon">
            ✓
          </div>

          <div>

            <small>
              In Stock
            </small>

            <b>
              {counts.inStock}
            </b>

          </div>

        </div>


        <div className="mini warn">

          <div className="inventory-mini-icon">
            !
          </div>

          <div>

            <small>
              Low Stock
            </small>

            <b>
              {counts.lowStock}
            </b>

          </div>

        </div>


        <div className="mini danger">

          <div className="inventory-mini-icon">
            ×
          </div>

          <div>

            <small>
              Out of Stock
            </small>

            <b>
              {counts.outOfStock}
            </b>

          </div>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="inventory-error">
          {error}
        </div>

      )}


      {/* =====================================================
          INVENTORY TABLE
      ===================================================== */}

      <Panel>

        <div className="inventory-toolbar">

          <div>

            <h3>
              Inventory
            </h3>

            <small>
              Manage stock for every product variant.
            </small>

          </div>


          <div className="inventory-controls">

            <input
              type="text"
              placeholder="Search product, SKU..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />


            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                All
              </option>

              <option value="IN_STOCK">
                In Stock
              </option>

              <option value="LOW_STOCK">
                Low Stock
              </option>

              <option value="OUT_OF_STOCK">
                Out of Stock
              </option>

            </select>

          </div>

        </div>


        {loading && (

          <div className="empty-state">
            Loading inventory...
          </div>

        )}


        {!loading &&
          !error &&
          filteredInventory.length === 0 && (

          <div className="empty-state">

            {inventory.length === 0
              ? "No inventory found."
              : "No inventory matches your search."}

          </div>

        )}


        {!loading &&
          filteredInventory.length > 0 && (

          <div className="inventory-table-wrapper">

            <table className="inventory-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Color
                  </th>

                  <th>
                    Size
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
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredInventory.map(
                  (item) => {

                    const statusInfo =
                      getStatus(item);

                    const isEditing =
                      editingId ===
                      item.id;


                    return (

                      <tr
                        key={item.id}
                      >

                        {/* PRODUCT */}

                        <td>

                          <div className="inventory-product">

                            <b>
                              {item.product_name ||
                                "—"}
                            </b>

                          </div>

                        </td>


                        {/* SKU */}

                        <td>

                          <span className="inventory-sku">
                            {item.sku ||
                              "—"}
                          </span>

                        </td>


                        {/* COLOR */}

                        <td>
                          {item.color_name ||
                            "—"}
                        </td>


                        {/* SIZE */}

                        <td>
                          {item.size_name ||
                            "—"}
                        </td>


                        {/* PRICE */}

                        <td>

                          ₹
                          {Number(
                            item.selling_price ??
                            item.discount_price ??
                            item.price ??
                            0
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}

                        </td>


                        {/* STOCK */}

                        <td>

                          {isEditing ? (

                            <input
                              className="inventory-stock-input"
                              type="number"
                              min="0"
                              step="1"
                              value={
                                stockValue
                              }
                              onChange={(
                                event
                              ) =>
                                setStockValue(
                                  event.target.value
                                )
                              }
                              disabled={
                                saving
                              }
                              autoFocus
                            />

                          ) : (

                            <b
                              className={
                                Number(
                                  item.stock
                                ) <= 5
                                  ? "stock-number low"
                                  : "stock-number"
                              }
                            >
                              {item.stock ?? 0}
                            </b>

                          )}

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              statusInfo.className
                            }
                          >
                            {statusInfo.label}
                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          {isEditing ? (

                            <div className="inventory-actions">

                              <button
                                type="button"
                                className="inventory-save"
                                onClick={() =>
                                  saveStock(
                                    item.id
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                {saving
                                  ? "Saving..."
                                  : "Save"}
                              </button>


                              <button
                                type="button"
                                className="inventory-cancel"
                                onClick={
                                  cancelEditing
                                }
                                disabled={
                                  saving
                                }
                              >
                                Cancel
                              </button>

                            </div>

                          ) : (

                            <button
                              type="button"
                              className="inventory-edit"
                              onClick={() =>
                                startEditing(
                                  item
                                )
                              }
                            >
                              Edit
                            </button>

                          )}

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