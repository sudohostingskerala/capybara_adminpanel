import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  Header,
  Panel,
} from "../components/UI";

import { orderApi } from "../services/api";


const statuses = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];


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


export default function OrderDetails() {

  const { id } = useParams();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("");


  // =========================================================
  // LOAD ORDER
  // =========================================================

  const loadOrder = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await orderApi.detail(id);

      const data =
        response.data;

      setOrder(data);

      setSelectedStatus(
        data.status || "PENDING"
      );

    } catch (err) {

      console.error(
        "ORDER DETAIL ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load order."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadOrder();

  }, [id]);


  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async () => {

    if (!order) {
      return;
    }

    if (
      selectedStatus ===
      order.status
    ) {
      return;
    }

    try {

      setSaving(true);
      setError("");

      const response =
        await orderApi.updateStatus(
          order.id,
          selectedStatus
        );

      setOrder(
        response.data
      );

    } catch (err) {

      console.error(
        "ORDER STATUS ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to update order status."
      );

      setSelectedStatus(
        order.status
      );

    } finally {

      setSaving(false);

    }
  };


  // =========================================================
  // HELPERS
  // =========================================================

  const money = (value) => {

    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
      }
    )}`;
  };


  const formatDateTime = (value) => {

    if (!value) {
      return "—";
    }

    return new Date(
      value
    ).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };


  // =========================================================
  // RENDER
  // =========================================================

  if (loading) {

    return (
      <>

        <Header
          title="Order Details"
          desc={`Orders / #${id}`}
        />

        <Panel>

          <div className="empty">
            Loading order...
          </div>

        </Panel>

      </>
    );
  }


  if (error && !order) {

    return (
      <>

        <Header
          title="Order Details"
          desc={`Orders / #${id}`}
        />

        <Panel>

          <div className="empty">
            {error}
          </div>

        </Panel>

      </>
    );
  }


  if (!order) {
    return null;
  }


  return (
    <>

      <Header
        title={`Order #${order.order_number}`}
        desc="View order information and manage fulfillment."
      >

        <Link
          className="btn secondary"
          to="/admin/orders"
        >
          ← Back to Orders
        </Link>

      </Header>


      {error && (

        <div className="category-form-error">
          {error}
        </div>

      )}


      {/* =====================================================
          TOP SUMMARY
      ===================================================== */}

      <div
        className="order-summary-grid"
      >

        <Panel>

          <div className="order-summary-card">

            <span>
              Order Status
            </span>

            <strong
              className={
                statusClass(
                  order.status
                )
              }
            >
              {order.status}
            </strong>

          </div>

        </Panel>


        <Panel>

          <div className="order-summary-card">

            <span>
              Payment
            </span>

            <strong
              className={
                order.payment_status ===
                "PAID"
                  ? "payment-status paid"
                  : "payment-status pending"
              }
            >
              {order.payment_status}
            </strong>

          </div>

        </Panel>


        <Panel>

          <div className="order-summary-card">

            <span>
              Total
            </span>

            <strong>
              {money(
                order.total_amount
              )}
            </strong>

          </div>

        </Panel>


        <Panel>

          <div className="order-summary-card">

            <span>
              Ordered
            </span>

            <strong>
              {formatDateTime(
                order.created_at
              )}
            </strong>

          </div>

        </Panel>

      </div>


      {/* =====================================================
          STATUS UPDATE
      ===================================================== */}

      <Panel>

        <div className="order-status-editor">

          <div>

            <h3>
              Update Order Status
            </h3>

            <small>
              Change the fulfillment status of this order.
            </small>

          </div>


          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value
                )
              }
              disabled={
                order.status ===
                  "CANCELLED" ||
                order.status ===
                  "DELIVERED" ||
                saving
              }
            >

              {statuses.map(
                (status) => (

                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>

              ))}

            </select>


            <button
              type="button"
              className="btn"
              onClick={
                updateStatus
              }
              disabled={
                saving ||
                selectedStatus ===
                  order.status ||
                order.status ===
                  "CANCELLED" ||
                order.status ===
                  "DELIVERED"
              }
            >
              {saving
                ? "Updating..."
                : "Update Status"}
            </button>

          </div>

        </div>

      </Panel>


      {/* =====================================================
          CUSTOMER + ADDRESS
      ===================================================== */}

      <div
        className="order-details-grid"
      >

        <Panel>

          <div className="order-section">

            <h3>
              Customer Information
            </h3>

            <div className="details">

              <p>
                <span>
                  Name
                </span>

                <b>
                  {order.full_name ||
                    "—"}
                </b>
              </p>


              <p>
                <span>
                  Email
                </span>

                <b>
                  {order.customer_email ||
                    "—"}
                </b>
              </p>


              <p>
                <span>
                  Phone
                </span>

                <b>
                  {order.phone_number ||
                    "—"}
                </b>
              </p>

            </div>

          </div>

        </Panel>


        <Panel>

          <div className="order-section">

            <h3>
              Shipping Address
            </h3>

            <div className="address-block">

              <strong>
                {order.full_name}
              </strong>

              <p>
                {order.house_name}
              </p>

              {order.street && (
                <p>
                  {order.street}
                </p>
              )}

              {order.landmark && (
                <p>
                  {order.landmark}
                </p>
              )}

              <p>
                {order.city},{" "}
                {order.district}
              </p>

              <p>
                {order.state} -{" "}
                {order.pincode}
              </p>

              {order.phone_number && (
                <p>
                  📞 {order.phone_number}
                </p>
              )}

            </div>

          </div>

        </Panel>

      </div>


      {/* =====================================================
          ORDER ITEMS
      ===================================================== */}

      <Panel>

        <div className="order-section">

          <h3>
            Order Items
          </h3>


          {order.items?.length ? (

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
                    Quantity
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Total
                  </th>

                </tr>

              </thead>


              <tbody>

                {order.items.map(
                  (item) => (

                  <tr
                    key={item.id}
                  >

                    <td>

                      <b>
                        {item.product_name ||
                          item.product?.name ||
                          "Product"}
                      </b>

                      {item.variant_name && (

                        <small
                          style={{
                            display: "block",
                            marginTop: "4px",
                            color: "#8a93a1",
                          }}
                        >
                          {item.variant_name}
                        </small>

                      )}

                    </td>


                    <td>
                      {item.sku ||
                        item.variant_sku ||
                        "—"}
                    </td>


                    <td>
                      {item.quantity}
                    </td>


                    <td>
                      {money(
                        item.price
                      )}
                    </td>


                    <td>

                      <b>
                        {money(
                          item.total_price ??
                          (
                            Number(
                              item.price || 0
                            ) *
                            Number(
                              item.quantity || 0
                            )
                          )
                        )}
                      </b>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          ) : (

            <div className="empty">
              No order items found.
            </div>

          )}

        </div>

      </Panel>


      {/* =====================================================
          PRICE BREAKDOWN
      ===================================================== */}

      <Panel>

        <div className="order-section">

          <h3>
            Order Summary
          </h3>


          <div className="order-total-box">

            <div>
              <span>
                Subtotal
              </span>

              <b>
                {money(
                  order.subtotal
                )}
              </b>
            </div>


            <div>
              <span>
                Shipping
              </span>

              <b>
                {money(
                  order.shipping_charge
                )}
              </b>
            </div>


            <div>
              <span>
                Discount
              </span>

              <b>
                -{money(
                  order.discount
                )}
              </b>
            </div>


            <div className="grand-total">

              <span>
                Total
              </span>

              <strong>
                {money(
                  order.total_amount
                )}
              </strong>

            </div>

          </div>

        </div>

      </Panel>


      {/* =====================================================
          PAYMENT DETAILS
      ===================================================== */}

      <Panel>

        <div className="order-section">

          <h3>
            Payment Information
          </h3>

          <div className="details">

            <p>

              <span>
                Payment Status
              </span>

              <b>
                {order.payment_status ||
                  "PENDING"}
              </b>

            </p>


            <p>

              <span>
                Razorpay Order ID
              </span>

              <b>
                {order.razorpay_order_id ||
                  "—"}
              </b>

            </p>


            <p>

              <span>
                Razorpay Payment ID
              </span>

              <b>
                {order.razorpay_payment_id ||
                  "—"}
              </b>

            </p>


            <p>

              <span>
                Payment Completed
              </span>

              <b>
                {formatDateTime(
                  order.payment_completed_at
                )}
              </b>

            </p>

          </div>

        </div>

      </Panel>

    </>
  );
}