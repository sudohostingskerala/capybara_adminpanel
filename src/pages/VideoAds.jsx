import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header, Panel } from "../components/UI";
import { videoAdApi } from "../services/api";

const videoUrl = (item) => item?.video_url || item?.video || "";
const productName = (item) =>
  item?.product_details?.name || item?.product_name || item?.product?.name || "—";

export default function VideoAds() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await videoAdApi.list();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setItems(data);
    } catch (err) {
      console.error("VIDEO ADS LOAD ERROR:", err.response?.data || err);
      setError(
        err.response?.data?.detail ||
        "Unable to load video advertisements. Check that the backend admin endpoint is available."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete video advertisement "${item.title}"?`)) return;
    try {
      setDeletingId(item.id);
      await videoAdApi.remove(item.id);
      setItems((previous) => previous.filter((video) => video.id !== item.id));
    } catch (err) {
      console.error("VIDEO AD DELETE ERROR:", err.response?.data || err);
      window.alert(err.response?.data?.detail || "Unable to delete this video advertisement.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Header
        title="Video Advertisements"
        desc="Manage shoppable videos displayed on the storefront."
      >
        <Link className="btn" to="/admin/video-ads/new">+ Add Video</Link>
      </Header>

      <Panel>
        {loading && <div className="empty">Loading video advertisements...</div>}
        {!loading && error && <div className="empty" role="alert">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="empty">
            No video advertisements found. Select “Add Video” to create one.
          </div>
        )}
        {!loading && !error && items.length > 0 && (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Title</th>
                  <th>Linked product</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {videoUrl(item) ? (
                        <video
                          src={videoUrl(item)}
                          muted
                          playsInline
                          preload="metadata"
                          style={{ width: 76, height: 100, objectFit: "cover", borderRadius: 7, background: "#111" }}
                        />
                      ) : <span>—</span>}
                    </td>
                    <td><strong>{item.title || "Untitled video"}</strong></td>
                    <td>{productName(item)}</td>
                    <td>{item.display_order ?? 0}</td>
                    <td>
                      <span style={{ color: item.is_active ? "#16834a" : "#7b8494", fontWeight: 600 }}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <Link className="btn btn-small" to={`/admin/video-ads/${item.id}/edit`}>Edit</Link>
                        <button
                          type="button"
                          className="btn btn-small"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item)}
                          style={{ background: "#fff", color: "#c83232", border: "1px solid #f0caca" }}
                        >
                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
