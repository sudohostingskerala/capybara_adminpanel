import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Header,
  Panel,
} from "../components/UI";

import { orderApi } from "../services/api";


const statusClass = (status) => {

  switch (status) {

    case "DELIVERED":
      return "order-status delivered";

    case "CANCELLED":
      return "order-status cancelled";

    case "SHIPPED":
      return "order-status shipped";

    case "PACKED":
      return "order-status packed";

    case "CONFIRMED":
      return "order-status confirmed";

    default:
      return "order-status pending";
  }
};


const paymentClass = (status) => {

  switch (status) {

    case "PAID":
      return "payment-status paid";

    case "FAILED":
      return "payment-status failed";

    case "REFUNDED":
      return "payment-status refunded";

    default:
      return "payment-status pending";
  }
};


export default function Orders() {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================================
  // LOAD ORDERS
  // =========================================================

  const loadOrders = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await orderApi.list();

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

      setOrders(data);

    } catch (err) {

      console.error(
        "ORDER LIST ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load orders."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadOrders();

  }, []);


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>

      <Header
        title="Orders"
        desc="Manage customer orders and fulfillment."
      />


      <Panel>

        {loading && (

          <div className="empty">
            Loading orders...
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
          orders.length === 0 && (

          <div className="empty">
            No orders found.
          </div>

        )}


        {!loading &&
          !error &&
          orders.length > 0 && (

          <table>

            <thead>

              <tr>

                <th>
                  Order
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Date
                </th>

                <th>
                  Total
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Status
                </th>

                <th />

              </tr>

            </thead>


            <tbody>

              {orders.map(
                (order) => (

                <tr
                  key={order.id}
                >

                  {/* ORDER */}

                  <td>

                    <div>
                      <b>
                        #{order.order_number}
                      </b>

                      <small
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: "#8a93a1",
                        }}
                      >
                        {order.order_source ===
                        "BUY_NOW"
                          ? "Buy Now"
                          : "Cart"}
                      </small>
                    </div>

                  </td>


                  {/* CUSTOMER */}

                  <td>

                    <div>

                      <b>
                        {order.customer_name ||
                          order.full_name ||
                          "—"}
                      </b>

                      {order.customer_email && (

                        <small
                          style={{
                            display: "block",
                            marginTop: "4px",
                            color: "#8a93a1",
                          }}
                        >
                          {order.customer_email}
                        </small>

                      )}

                    </div>

                  </td>


                  {/* DATE */}

                  <td>
                    {formatDate(
                      order.created_at
                    )}
                  </td>


                  {/* TOTAL */}

                  <td>

                    <b>
                      ₹
                      {Number(
                        order.total_amount || 0
                      ).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </b>

                  </td>


                  {/* PAYMENT */}

                  <td>

                    <span
                      className={
                        paymentClass(
                          order.payment_status
                        )
                      }
                    >
                      {order.payment_status ||
                        "PENDING"}
                    </span>

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={
                        statusClass(
                          order.status
                        )
                      }
                    >
                      {order.status ||
                        "PENDING"}
                    </span>

                  </td>


                  {/* ACTION */}

                  <td>

                    <Link
                      className="action"
                      to={`/admin/orders/${order.id}`}
                    >
                      View
                    </Link>

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