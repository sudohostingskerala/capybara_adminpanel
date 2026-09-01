import { useEffect, useMemo, useState } from "react";

import {
  Header,
  Panel,
} from "../components/UI";

import {
  productAdminApi,
  categoryApi,
  orderApi,
  inventoryApi,
} from "../services/api";


export default function Dashboard() {

  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [orders, setOrders] = useState([]);

  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  const loadDashboard = async () => {

    try {

      setLoading(true);

      setError("");


      const [
        productsResponse,
        categoriesResponse,
        ordersResponse,
        inventoryResponse,
      ] = await Promise.all([

        productAdminApi.list(),

        categoryApi.list(),

        orderApi.list(),

        inventoryApi.list(),

      ]);


      // -----------------------------------------------------
      // PRODUCTS
      // -----------------------------------------------------

      const productData =
        Array.isArray(
          productsResponse.data
        )
          ? productsResponse.data
          : productsResponse.data?.results || [];


      // -----------------------------------------------------
      // CATEGORIES
      // -----------------------------------------------------

      const categoryData =
        Array.isArray(
          categoriesResponse.data
        )
          ? categoriesResponse.data
          : categoriesResponse.data?.results || [];


      // -----------------------------------------------------
      // ORDERS
      // -----------------------------------------------------

      const orderData =
        Array.isArray(
          ordersResponse.data
        )
          ? ordersResponse.data
          : ordersResponse.data?.results || [];


      // -----------------------------------------------------
      // INVENTORY
      // -----------------------------------------------------

      const inventoryData =
        Array.isArray(
          inventoryResponse.data
        )
          ? inventoryResponse.data
          : inventoryResponse.data?.results || [];


      setProducts(productData);

      setCategories(categoryData);

      setOrders(orderData);

      setInventory(inventoryData);


    } catch (err) {

      console.error(
        "DASHBOARD LOAD ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load dashboard data."
      );


    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadDashboard();

  }, []);


  // =========================================================
  // PAID ORDERS
  // =========================================================

  const paidOrders = useMemo(() => {

    return orders.filter(
      (order) =>
        String(
          order.payment_status || ""
        ).toUpperCase() === "PAID"
    );

  }, [orders]);


  // =========================================================
  // SALES
  // =========================================================

  const totalSales = useMemo(() => {

    return paidOrders.reduce(
      (total, order) => {

        return (
          total +
          Number(
            order.total_amount || 0
          )
        );

      },
      0
    );

  }, [paidOrders]);


  // =========================================================
  // INVENTORY ALERTS
  // =========================================================

  const lowStockItems = useMemo(() => {

    return inventory.filter(
      (item) => {

        const stock =
          Number(
            item.stock || 0
          );

        return (
          stock > 0 &&
          stock <= 5
        );

      }
    );

  }, [inventory]);


  const outOfStockItems = useMemo(() => {

    return inventory.filter(
      (item) =>
        Number(
          item.stock || 0
        ) <= 0
    );

  }, [inventory]);


  // =========================================================
  // RECENT ORDERS
  // =========================================================

  const recentOrders = useMemo(() => {

    return [...orders]

      .sort(
        (a, b) =>
          new Date(
            b.created_at
          ) -
          new Date(
            a.created_at
          )
      )

      .slice(0, 5);

  }, [orders]);


  // =========================================================
  // SALES OVERVIEW
  // =========================================================

  const salesOverview = useMemo(() => {

    const days = [];

    const today =
      new Date();


    for (
      let i = 6;
      i >= 0;
      i--
    ) {

      const date =
        new Date(today);

      date.setDate(
        today.getDate() - i
      );

      date.setHours(
        0,
        0,
        0,
        0
      );


      const nextDate =
        new Date(date);

      nextDate.setDate(
        date.getDate() + 1
      );


      const sales =
        paidOrders.reduce(
          (
            total,
            order
          ) => {

            const orderDate =
              new Date(
                order.created_at
              );

            if (
              orderDate >= date &&
              orderDate < nextDate
            ) {

              return (
                total +
                Number(
                  order.total_amount ||
                  0
                )
              );

            }

            return total;

          },
          0
        );


      days.push({
        date,
        sales,
      });

    }


    return days;

  }, [paidOrders]);


  // =========================================================
  // CHART VALUES
  // =========================================================

  const maxSales = Math.max(
    ...salesOverview.map(
      (item) =>
        item.sales
    ),
    1
  );


  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (
    value
  ) => {

    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    );

  };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    value
  ) => {

    if (!value) {
      return "—";
    }

    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );

  };


  // =========================================================
  // ORDER STATUS CLASS
  // =========================================================

  const getOrderStatusClass = (
    status
  ) => {

    const normalized =
      String(
        status || ""
      ).toLowerCase();


    if (
      normalized ===
      "delivered"
    ) {

      return "dashboard-status delivered";

    }


    if (
      normalized ===
      "cancelled"
    ) {

      return "dashboard-status cancelled";

    }


    if (
      normalized ===
      "shipped"
    ) {

      return "dashboard-status shipped";

    }


    if (
      normalized ===
      "packed"
    ) {

      return "dashboard-status packed";

    }


    return "dashboard-status pending";

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>

      <Header
        title="Dashboard"
        desc="Overview of your store performance."
      />


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="dashboard-error">
          {error}
        </div>

      )}


      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="stats four">


        {/* ORDERS */}

        <div className="mini">

          <div className="dashboard-stat-icon">
            🛍
          </div>

          <div>

            <small>
              Total Orders
            </small>

            <b>
              {loading
                ? "—"
                : orders.length}
            </b>

          </div>

        </div>


        {/* PRODUCTS */}

        <div className="mini">

          <div className="dashboard-stat-icon">
            📦
          </div>

          <div>

            <small>
              Products
            </small>

            <b>
              {loading
                ? "—"
                : products.length}
            </b>

          </div>

        </div>


        {/* CATEGORIES */}

        <div className="mini">

          <div className="dashboard-stat-icon">
            ◈
          </div>

          <div>

            <small>
              Categories
            </small>

            <b>
              {loading
                ? "—"
                : categories.length}
            </b>

          </div>

        </div>


        {/* SALES */}

        <div className="mini">

          <div className="dashboard-stat-icon">
            ₹
          </div>

          <div>

            <small>
              Paid Sales
            </small>

            <b>
              {loading
                ? "—"
                : formatMoney(
                    totalSales
                  )}
            </b>

          </div>

        </div>

      </div>


      {/* =====================================================
          SALES OVERVIEW
      ===================================================== */}

      <Panel>

        <div className="dashboard-section-header">

          <div>

            <h3>
              Sales Overview
            </h3>

            <small>
              Paid sales for the last 7 days.
            </small>

          </div>

          <strong>
            {formatMoney(
              salesOverview.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  item.sales,
                0
              )
            )}
          </strong>

        </div>


        <div className="sales-chart">

          {salesOverview.map(
            (
              item,
              index
            ) => {

              const height =
                item.sales === 0
                  ? 3
                  : Math.max(
                      8,
                      (
                        item.sales /
                        maxSales
                      ) * 100
                    );


              return (

                <div
                  className="sales-chart-column"
                  key={index}
                >

                  <div className="sales-chart-value">

                    {item.sales > 0
                      ? formatMoney(
                          item.sales
                        )
                      : "₹0"}

                  </div>


                  <div className="sales-chart-bar-wrap">

                    <div
                      className="sales-chart-bar"
                      style={{
                        height:
                          `${height}%`,
                      }}
                    />

                  </div>


                  <small>
                    {item.date.toLocaleDateString(
                      "en-IN",
                      {
                        weekday:
                          "short",
                      }
                    )}
                  </small>

                </div>

              );

            }
          )}

        </div>

      </Panel>


      {/* =====================================================
          LOWER GRID
      ===================================================== */}

      <div className="dashboard-grid">


        {/* ===================================================
            RECENT ORDERS
        =================================================== */}

        <Panel>

          <div className="dashboard-section-header">

            <div>

              <h3>
                Recent Orders
              </h3>

              <small>
                Latest orders from your store.
              </small>

            </div>

          </div>


          {loading ? (

            <div className="empty-state">
              Loading orders...
            </div>

          ) : recentOrders.length === 0 ? (

            <div className="empty-state">
              No orders found.
            </div>

          ) : (

            <div className="dashboard-order-list">

              {recentOrders.map(
                (order) => (

                  <div
                    className="dashboard-order"
                    key={order.id}
                  >

                    <div>

                      <b>
                        #{order.order_number}
                      </b>

                      <small>
                        {formatDate(
                          order.created_at
                        )}
                      </small>

                    </div>


                    <div>

                      <strong>
                        {formatMoney(
                          order.total_amount
                        )}
                      </strong>

                      <span
                        className={
                          getOrderStatusClass(
                            order.status
                          )
                        }
                      >
                        {order.status ||
                          "Pending"}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </Panel>


        {/* ===================================================
            INVENTORY ALERTS
        =================================================== */}

        <Panel>

          <div className="dashboard-section-header">

            <div>

              <h3>
                Inventory Alerts
              </h3>

              <small>
                Products that need attention.
              </small>

            </div>

          </div>


          {loading ? (

            <div className="empty-state">
              Loading inventory...
            </div>

          ) : (
            lowStockItems.length === 0 &&
            outOfStockItems.length === 0
          ) ? (

            <div className="dashboard-inventory-good">

              <div>
                ✓
              </div>

              <b>
                Inventory looks good
              </b>

              <small>
                No low-stock or out-of-stock variants.
              </small>

            </div>

          ) : (

            <div className="dashboard-alert-list">

              {outOfStockItems
                .slice(0, 4)
                .map(
                  (item) => (

                    <div
                      className="dashboard-alert danger"
                      key={`out-${item.id}`}
                    >

                      <div className="dashboard-alert-icon">
                        ×
                      </div>

                      <div>

                        <b>
                          {item.product_name}
                        </b>

                        <small>
                          {item.color_name}
                          {" • "}
                          {item.size_name}
                        </small>

                      </div>

                      <strong>
                        Out
                      </strong>

                    </div>

                  )
                )}


              {lowStockItems
                .slice(
                  0,
                  Math.max(
                    0,
                    5 -
                    outOfStockItems.length
                  )
                )
                .map(
                  (item) => (

                    <div
                      className="dashboard-alert warning"
                      key={`low-${item.id}`}
                    >

                      <div className="dashboard-alert-icon">
                        !
                      </div>

                      <div>

                        <b>
                          {item.product_name}
                        </b>

                        <small>
                          {item.color_name}
                          {" • "}
                          {item.size_name}
                        </small>

                      </div>

                      <strong>
                        {item.stock}
                      </strong>

                    </div>

                  )
                )}

            </div>

          )}

        </Panel>

      </div>

    </>
  );
}