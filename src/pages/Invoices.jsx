import { Header, Panel } from "../components/UI";

export default function Invoices() {
  return (
    <>
      <Header
        title="Invoices"
        desc="View issued invoices and download their stored PDFs."
      />

      <Panel>
        <div className="invoice-unavailable" role="status">
          <span className="invoice-unavailable-icon" aria-hidden="true">i</span>
          <div>
            <h2>Invoice access is not available in this dashboard yet</h2>
            <p>
              The admin API currently provides orders without invoice numbers,
              invoice status, or invoice snapshots. Its PDF link endpoint is
              limited to the customer who owns an order, so this dashboard
              cannot use it for administrators.
            </p>
            <p>
              Connect this page after the backend exposes an authenticated
              admin invoice list, invoice detail, and PDF download capability.
            </p>
          </div>
        </div>
      </Panel>
    </>
  );
}
