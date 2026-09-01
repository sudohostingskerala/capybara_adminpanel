import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Header,
  Panel,
} from "../components/UI";

import { bannerApi } from "../services/api";


export default function BannerForm() {

  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    button_text: "",
    button_url: "",
    display_order: 0,
    is_active: true,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [removeExistingImage, setRemoveExistingImage] =
    useState(false);


  // =========================================================
  // LOAD BANNER
  // =========================================================

  const loadBanner = async () => {

    if (!isEditMode) {
      return;
    }

    try {

      setLoading(true);
      setError("");

      const response =
        await bannerApi.detail(id);

      const banner = response.data;

      setForm({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        button_text: banner.button_text || "",
        button_url: banner.button_url || "",
        display_order:
          banner.display_order ?? 0,
        is_active:
          banner.is_active !== false,
      });

      if (banner.image) {
        setExistingImage(
          banner.image
        );
      }

    } catch (err) {

      console.error(
        "BANNER DETAIL ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load banner."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadBanner();
  }, [id]);


  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  const handleImageChange = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);

    setRemoveExistingImage(false);

    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);

    event.target.value = "";
  };


  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  const handleRemoveImage = () => {

    setImage(null);
    setPreview("");

    if (existingImage) {
      setRemoveExistingImage(true);
    }
  };


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (!form.title.trim()) {
      setError("Banner title is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {

      const formData =
        new FormData();

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "subtitle",
        form.subtitle
      );

      formData.append(
        "button_text",
        form.button_text
      );

      formData.append(
        "button_url",
        form.button_url
      );

      formData.append(
        "display_order",
        String(form.display_order)
      );

      formData.append(
        "is_active",
        String(form.is_active)
      );


      // -------------------------------------------------------
      // IMAGE
      // -------------------------------------------------------

      if (image) {

        formData.append(
          "image",
          image
        );

      }


      // -------------------------------------------------------
      // REMOVE IMAGE
      // -------------------------------------------------------

      if (removeExistingImage) {

        formData.append(
          "remove_image",
          "true"
        );

      }


      // -------------------------------------------------------
      // CREATE / UPDATE
      // -------------------------------------------------------

      if (isEditMode) {

        await bannerApi.update(
          id,
          formData
        );

      } else {

        await bannerApi.create(
          formData
        );

      }


      // -------------------------------------------------------
      // SUCCESS
      // -------------------------------------------------------

      navigate(
        "/admin/banners"
      );

    } catch (err) {

      console.error(
        "BANNER SAVE ERROR:",
        err.response?.data || err
      );

      const backendError =
        err.response?.data;

      if (
        backendError &&
        typeof backendError === "object"
      ) {

        const firstError =
          Object.values(
            backendError
          )[0];

        if (Array.isArray(firstError)) {

          setError(
            firstError[0]
          );

        } else {

          setError(
            String(firstError)
          );

        }

      } else {

        setError(
          "Unable to save banner."
        );

      }

    } finally {

      setSaving(false);

    }
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="category-form-page">

      <Header
        title={
          isEditMode
            ? "Edit Banner"
            : "Add Banner"
        }
        desc={
          isEditMode
            ? "Update your promotional banner."
            : "Create a new promotional banner."
        }
      />


      {loading ? (

        <Panel>

          <div className="empty">
            Loading banner...
          </div>

        </Panel>

      ) : (

        <form
          onSubmit={handleSubmit}
        >

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="category-form-error">
              {error}
            </div>

          )}


          {/* =================================================
              MAIN INFORMATION
          ================================================= */}

          <div className="category-form-grid">

            <Panel>

              <div className="category-form-panel">

                <h3>
                  Banner Information
                </h3>

                <span className="category-form-subtitle">
                  Create the content displayed
                  in your storefront banner.
                </span>


                <div className="category-fields two">


                  {/* TITLE */}

                  <label className="category-field">

                    Title *

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Summer Collection"
                      required
                    />

                  </label>


                  {/* DISPLAY ORDER */}

                  <label className="category-field">

                    Display Order

                    <input
                      type="number"
                      name="display_order"
                      value={
                        form.display_order
                      }
                      onChange={handleChange}
                      min="0"
                    />

                    <small>
                      Lower numbers appear first.
                    </small>

                  </label>


                  {/* SUBTITLE */}

                  <label
                    className="category-field"
                    style={{
                      gridColumn: "1 / -1",
                    }}
                  >

                    Subtitle

                    <textarea
                      name="subtitle"
                      value={form.subtitle}
                      onChange={handleChange}
                      placeholder="e.g. Discover our latest styles..."
                      rows={3}
                    />

                  </label>


                  {/* BUTTON TEXT */}

                  <label className="category-field">

                    Button Text

                    <input
                      type="text"
                      name="button_text"
                      value={
                        form.button_text
                      }
                      onChange={handleChange}
                      placeholder="Shop Now"
                    />

                  </label>


                  {/* BUTTON URL */}

                  <label className="category-field">

                    Button URL

                    <input
                      type="text"
                      name="button_url"
                      value={
                        form.button_url
                      }
                      onChange={handleChange}
                      placeholder="/products"
                    />

                  </label>

                </div>

              </div>

            </Panel>


            {/* =================================================
                SETTINGS
            ================================================= */}

            <Panel>

              <div className="category-form-panel">

                <h3>
                  Banner Settings
                </h3>

                <span className="category-form-subtitle">
                  Control where and when the
                  banner is displayed.
                </span>


                <div className="category-settings">

                  <label className="category-toggle">

                    <div className="category-toggle-text">

                      <strong>
                        Active
                      </strong>

                      <small>
                        Show this banner to
                        customers.
                      </small>

                    </div>

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        form.is_active
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span className="category-toggle-ui" />

                  </label>

                </div>


                {/* SUMMARY */}

                <div className="category-summary">

                  <h4>
                    Banner Summary
                  </h4>

                  <div className="category-summary-row">

                    <span>
                      Title
                    </span>

                    <strong>
                      {form.title || "—"}
                    </strong>

                  </div>

                  <div className="category-summary-row">

                    <span>
                      Order
                    </span>

                    <strong>
                      {form.display_order}
                    </strong>

                  </div>

                  <div className="category-summary-row">

                    <span>
                      Status
                    </span>

                    <strong>
                      {form.is_active
                        ? "Active"
                        : "Inactive"}
                    </strong>

                  </div>

                </div>

              </div>

            </Panel>

          </div>


          {/* =================================================
              IMAGE
          ================================================= */}

          <div
            style={{
              marginTop: "18px",
            }}
          >

            <Panel>

              <div className="category-form-panel">

                <h3>
                  Banner Image
                </h3>

                <span className="category-form-subtitle">
                  Upload the main promotional
                  image for this banner.
                </span>


                <div className="category-image-section">


                  {/* PREVIEW */}

                  {(preview ||
                    (
                      existingImage &&
                      !removeExistingImage
                    )) && (

                    <div
                      className="category-image-preview"
                      style={{
                        maxWidth: "620px",
                        aspectRatio: "16 / 7",
                      }}
                    >

                      <img
                        src={
                          preview ||
                          existingImage
                        }
                        alt={
                          form.title ||
                          "Banner"
                        }
                      />

                      <button
                        type="button"
                        className="category-image-remove"
                        onClick={
                          handleRemoveImage
                        }
                      >
                        ×
                      </button>

                    </div>

                  )}


                  {/* UPLOAD */}

                  <label className="category-upload">

                    <div className="category-upload-icon">
                      ↑
                    </div>

                    <strong>
                      {image
                        ? "Change Banner Image"
                        : "Choose Banner Image"}
                    </strong>

                    <small>
                      PNG, JPG or WEBP
                    </small>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      hidden
                      onChange={
                        handleImageChange
                      }
                    />

                  </label>

                </div>

              </div>

            </Panel>

          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="category-form-actions">

            <button
              type="button"
              className="btn secondary"
              onClick={() =>
                navigate(
                  "/admin/banners"
                )
              }
              disabled={saving}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Banner"}
            </button>

          </div>

        </form>

      )}

    </div>
  );
}