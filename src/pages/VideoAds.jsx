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
          <div className="video-ad-list">
            {items.map((item) => (
              <article className="video-ad-card" key={item.id}>
                {videoUrl(item) ? (
                  <video src={videoUrl(item)} controls muted playsInline preload="metadata" />
                ) : (
                  <div className="video-ad-no-preview">No video preview</div>
                )}
                <div className="video-ad-card-body">
                  <div className="video-ad-card-heading">
                    <h3>{item.title || "Untitled video"}</h3>
                    <span className={`video-ad-badge ${item.is_active ? "is-active" : "is-inactive"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p><strong>Product:</strong> {productName(item)}</p>
                  <p><strong>Display order:</strong> {item.display_order ?? 0}</p>
                  <div className="video-ad-card-actions">
                    <Link className="btn btn-small" to={`/admin/video-ads/${item.id}/edit`}>Edit</Link>
                    <button
                      type="button"
                      className="btn btn-small video-ad-delete"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item)}
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
