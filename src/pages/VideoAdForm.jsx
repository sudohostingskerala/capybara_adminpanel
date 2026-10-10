import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header, Panel } from "../components/UI";
import { productAdminApi, videoAdApi } from "../services/api";

const getVideoUrl = (item) => item?.video_url || item?.video || "";
const getProductId = (item) => {
  if (item?.product_details?.id != null) return String(item.product_details.id);
  if (item?.product && typeof item.product === "object") return String(item.product.id ?? "");
  return item?.product != null ? String(item.product) : "";
};
const errorMessage = (err, fallback) => {
  const data = err.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (data && typeof data === "object") {
    const first = Object.entries(data)[0];
    if (first) return `${first[0]}: ${Array.isArray(first[1]) ? first[1].join(" ") : String(first[1])}`;
  }
  return err.message || fallback;
};

export default function VideoAdForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [existingVideo, setExistingVideo] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [form, setForm] = useState({
    title: "",
    product: "",
    display_order: "0",
    is_active: true,
  });

  useEffect(() => {
    let alive = true;
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await productAdminApi.list();
        const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
        if (alive) setProducts(data);
      } catch (err) {
        console.error("VIDEO AD PRODUCT LIST ERROR:", err.response?.data || err);
        if (alive) setError(errorMessage(err, "Unable to load products for the selector."));
      } finally {
        if (alive) setProductsLoading(false);
      }
    };
    loadProducts();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let alive = true;
    const loadVideoAd = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await videoAdApi.detail(id);
        const item = response.data;
        if (!alive) return;
        setForm({
          title: item.title || "",
          product: getProductId(item),
          display_order: String(item.display_order ?? 0),
          is_active: item.is_active !== false,
        });
        setExistingVideo(getVideoUrl(item));
      } catch (err) {
        console.error("VIDEO AD DETAIL ERROR:", err.response?.data || err);
        if (alive) setError(errorMessage(err, "Unable to load this video advertisement."));
      } finally {
        if (alive) setLoading(false);
      }
    };
    loadVideoAd();
    return () => { alive = false; };
  }, [id, isEditMode]);

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
  };

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("Video file must be 100 MB or smaller.");
      return;
    }
    setError("");
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Video title is required.");
    if (!form.product) return setError("Please select a product to link to this video.");
    if (!isEditMode && !videoFile) return setError("Please select a video file.");

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("product", form.product);
    payload.append("display_order", String(Number(form.display_order) || 0));
    payload.append("is_active", String(form.is_active));
    if (videoFile) payload.append("video", videoFile);

    try {
      setSaving(true);
      if (isEditMode) {
        await videoAdApi.update(id, payload);
      } else {
        await videoAdApi.create(payload);
      }
      navigate("/admin/video-ads", { replace: true });
    } catch (err) {
      console.error("VIDEO AD SAVE ERROR:", err.response?.data || err);
      setError(errorMessage(err, "Unable to save video advertisement."));
    } finally {
      setSaving(false);
    }
  };

  const currentVideo = videoPreview || existingVideo;

  if (loading) {
    return <><Header title={isEditMode ? "Edit Video" : "Add Video"} desc="Manage shoppable video content." /><Panel><div className="empty">Loading video advertisement...</div></Panel></>;
  }

  return (
    <>
      <Header
        title={isEditMode ? "Edit Video Advertisement" : "Add Video Advertisement"}
        desc="Upload a short video and connect it to a product."
      >
        <Link className="btn" to="/admin/video-ads">← Back to Videos</Link>
      </Header>
      <Panel>
        <form onSubmit={handleSubmit} className="video-ad-form">
          {error && <div className="video-ad-error" role="alert">{error}</div>}

          <section className="video-ad-panel">
            <h3>Video details</h3>
            <p className="video-ad-description">Give your shoppable video a clear title and connect it to a product.</p>
            <label className="video-ad-field">
            Video title <span style={{ color: "#c83232" }}>*</span>
            <input name="title" value={form.title} onChange={handleChange} required maxLength={200} placeholder="e.g. Festive collection" />
          </label>

          <label className="video-ad-field">
            Linked product <span style={{ color: "#c83232" }}>*</span>
            <select name="product" value={form.product} onChange={handleChange} required disabled={productsLoading}>
              <option value="">{productsLoading ? "Loading products..." : "Select a product"}</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            {!productsLoading && products.length === 0 && <small style={{ color: "#a52828" }}>No products were returned by the admin products API.</small>}
          </label>
          </section>

          <section className="video-ad-panel">
            <h3>Video preview & publishing</h3>
            <p className="video-ad-description">Upload a vertical video and configure how it appears on your storefront.</p>
          <div style={{ display: "grid", gap: 8, fontWeight: 600 }}>
            Video file {isEditMode ? <span style={{ color: "#7b8494", fontWeight: 400 }}>(optional when editing; leave empty to keep current video)</span> : <span style={{ color: "#c83232" }}>*</span>}
            <input type="file" accept="video/mp4,video/webm,video/quicktime,video/*" onChange={handleVideoChange} className="video-ad-file-input" />
            <small className="video-ad-help">Choose MP4, WebM, or MOV. Maximum file size: 100 MB.</small>
            {currentVideo && (
              <video key={currentVideo} src={currentVideo} controls muted playsInline preload="metadata" className="video-ad-preview" />
            )}
            {videoFile && <small className="video-ad-selected">Selected: {videoFile.name}</small>}
          </div>

          <label className="video-ad-field">
            Display order
            <input type="number" min="0" step="1" name="display_order" value={form.display_order} onChange={handleChange} />
            <small className="video-ad-help">Lower numbers appear first.</small>
          </label>

          <label className="video-ad-status">
            <span><strong>Publish video</strong><small>Active videos appear on the public storefront.</small></span>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
          </label>

          <div className="video-ad-actions">
            <button className="btn" type="submit" disabled={saving || productsLoading}>
              {saving ? "Saving..." : isEditMode ? "Save Changes" : "Upload Video"}
            </button>
            <Link className="btn" to="/admin/video-ads" style={{ background: "#fff", color: "#374151", border: "1px solid #d9dee8" }}>Cancel</Link>
          </div>
          </section>
        </form>
      </Panel>
    </>
  );
}
