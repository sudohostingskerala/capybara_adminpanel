import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Header,
  Panel,
} from "../components/UI";

import { categoryApi } from "../services/api";


export default function CategoryForm() {

  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);


  // =========================================================
  // STATE
  // =========================================================

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    parent: "",
    is_featured: false,
    is_active: true,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [removeExistingImage, setRemoveExistingImage] =
    useState(false);


  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  const loadCategories = async () => {

    try {

      const response = await categoryApi.list();

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

      setCategories(data);

    } catch (err) {

      console.error(
        "CATEGORY LIST ERROR:",
        err.response?.data || err
      );

    }
  };


  // =========================================================
  // LOAD CATEGORY
  // =========================================================

  const loadCategory = async () => {

    if (!isEditMode) {
      return;
    }

    try {

      setLoading(true);
      setError("");

      const response =
        await categoryApi.detail(id);

      const category = response.data;

      setForm({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        parent: category.parent || "",
        is_featured: Boolean(category.is_featured),
        is_active: category.is_active !== false,
      });

      if (category.image) {
        setExistingImage(category.image);
      }

    } catch (err) {

      console.error(
        "CATEGORY DETAIL ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load category."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadCategories();
    loadCategory();

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

    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      if (form.slug.trim()) {

        formData.append(
          "slug",
          form.slug.trim()
        );

      }

      formData.append(
        "description",
        form.description
      );


      // -------------------------------------------------------
      // PARENT
      // -------------------------------------------------------

      if (form.parent) {

        formData.append(
          "parent",
          form.parent
        );

      } else {

        formData.append(
          "parent",
          ""
        );

      }


      // -------------------------------------------------------
      // SETTINGS
      // -------------------------------------------------------

      formData.append(
        "is_featured",
        String(form.is_featured)
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
      // UPDATE / CREATE
      // -------------------------------------------------------

      if (isEditMode) {

        if (removeExistingImage) {

          formData.append(
            "remove_image",
            "true"
          );

        }

        await categoryApi.update(
          id,
          formData
        );

      } else {

        await categoryApi.create(
          formData
        );

      }


      // -------------------------------------------------------
      // SUCCESS
      // -------------------------------------------------------

      navigate(
        "/admin/categories"
      );

    } catch (err) {

      console.error(
        "CATEGORY SAVE ERROR:",
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
          "Unable to save category."
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
            ? "Edit Category"
            : "Add Category"
        }
        desc={
          isEditMode
            ? "Update category information."
            : "Create a new store category."
        }
      />


      {loading ? (

        <Panel>

          <div className="empty">
            Loading category...
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
              MAIN FORM
          ================================================= */}

          <div className="category-form-grid">


            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <Panel>

              <div className="category-form-panel">

                <h3>
                  Category Information
                </h3>

                <span className="category-form-subtitle">
                  Basic information used to organize
                  your products.
                </span>


                <div className="category-fields two">


                  {/* NAME */}

                  <label className="category-field">

                    Category Name *

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. T-Shirts"
                      required
                    />

                  </label>


                  {/* SLUG */}

                  <label className="category-field">

                    Slug

                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="t-shirts"
                    />

                    <small>
                      Leave empty to generate automatically.
                    </small>

                  </label>


                  {/* DESCRIPTION */}

                  <label
                    className="category-field"
                    style={{
                      gridColumn: "1 / -1",
                    }}
                  >

                    Description

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe this category..."
                    />

                  </label>

                </div>

              </div>

            </Panel>


            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <Panel>

              <div className="category-form-panel">

                <h3>
                  Category Settings
                </h3>

                <span className="category-form-subtitle">
                  Control visibility and organization.
                </span>


                {/* PARENT */}

                <label className="category-field">

                  Parent Category

                  <select
                    name="parent"
                    value={form.parent}
                    onChange={handleChange}
                  >

                    <option value="">
                      No Parent
                    </option>

                    {categories
                      .filter(
                        (category) =>
                          String(category.id) !==
                          String(id)
                      )
                      .map(
                        (category) => (

                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>

                        )
                      )}

                  </select>

                  <small>
                    Choose a parent if this is a
                    sub-category.
                  </small>

                </label>


                {/* SWITCHES */}

                <div className="category-settings">


                  {/* FEATURED */}

                  <label className="category-toggle">

                    <div className="category-toggle-text">

                      <strong>
                        Featured Category
                      </strong>

                      <small>
                        Highlight this category
                        in your store.
                      </small>

                    </div>

                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={form.is_featured}
                      onChange={handleChange}
                    />

                    <span className="category-toggle-ui" />

                  </label>


                  {/* ACTIVE */}

                  <label className="category-toggle">

                    <div className="category-toggle-text">

                      <strong>
                        Active
                      </strong>

                      <small>
                        Make this category visible
                        to customers.
                      </small>

                    </div>

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                    />

                    <span className="category-toggle-ui" />

                  </label>

                </div>


                {/* SUMMARY */}

                <div className="category-summary">

                  <h4>
                    Category Summary
                  </h4>

                  <div className="category-summary-row">

                    <span>
                      Name
                    </span>

                    <strong>
                      {form.name || "—"}
                    </strong>

                  </div>

                  <div className="category-summary-row">

                    <span>
                      Parent
                    </span>

                    <strong>
                      {form.parent
                        ? categories.find(
                            (category) =>
                              String(category.id) ===
                              String(form.parent)
                          )?.name || "—"
                        : "None"}
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

          <div style={{ marginTop: "18px" }}>

            <Panel>

              <div className="category-form-panel">

                <h3>
                  Category Image
                </h3>

                <span className="category-form-subtitle">
                  Upload a representative image
                  for this category.
                </span>


                <div className="category-image-section">


                  {/* PREVIEW */}

                  {(preview ||
                    (
                      existingImage &&
                      !removeExistingImage
                    )) && (

                    <div className="category-image-preview">

                      <img
                        src={
                          preview ||
                          existingImage
                        }
                        alt={form.name || "Category"}
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
                        ? "Change Category Image"
                        : "Choose Category Image"}
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
                  "/admin/categories"
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
                  : "Create Category"}
            </button>

          </div>

        </form>

      )}

    </div>
  );
}