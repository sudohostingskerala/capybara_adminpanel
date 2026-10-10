
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header, Panel } from "../components/UI";
import { colorApi, sizeApi } from "../services/api";

const getList = (response) =>
  Array.isArray(response.data)
    ? response.data
    : response.data?.results || [];

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (data && typeof data === "object") {
    const first = Object.entries(data)[0];

    if (first) {
      const message = Array.isArray(first[1])
        ? first[1].join(" ")
        : String(first[1]);

      return `${first[0]}: ${message}`;
    }
  }

  return fallback;
};

export default function ColorSize() {
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [colorName, setColorName] = useState("");
  const [hexCode, setHexCode] = useState("#000000");
  const [sizeName, setSizeName] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingColor, setSavingColor] = useState(false);
  const [savingSize, setSavingSize] = useState(false);

  const [colorError, setColorError] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOptions = async () => {
    try {
      setLoading(true);
      setColorError("");
      setSizeError("");

      const [colorResult, sizeResult] = await Promise.allSettled([
        colorApi.list(),
        sizeApi.list(),
      ]);

      if (colorResult.status === "fulfilled") {
        setColors(getList(colorResult.value));
      } else {
        setColorError(
          getErrorMessage(
            colorResult.reason,
            "Unable to load colors."
          )
        );
      }

      if (sizeResult.status === "fulfilled") {
        setSizes(getList(sizeResult.value));
      } else {
        setSizeError(
          getErrorMessage(
            sizeResult.reason,
            "Unable to load sizes."
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const handleAddColor = async (event) => {
    event.preventDefault();
    setColorError("");
    setSuccess("");

    const name = colorName.trim();

    if (!name) {
      setColorError("Please enter a color name.");
      return;
    }

    try {
      setSavingColor(true);

      const payload = {
        name,
        hex_code: hexCode || null,
      };

      const response = await colorApi.create(payload);

      setColors((previous) => [
        ...previous,
        response.data,
      ]);

      setColorName("");
      setHexCode("#000000");
      setSuccess(`Color "${name}" added successfully.`);
    } catch (error) {
      setColorError(
        getErrorMessage(error, "Unable to add this color.")
      );
    } finally {
      setSavingColor(false);
    }
  };

  const handleAddSize = async (event) => {
    event.preventDefault();
    setSizeError("");
    setSuccess("");

    const name = sizeName.trim();

    if (!name) {
      setSizeError("Please enter a size.");
      return;
    }

    try {
      setSavingSize(true);

      const response = await sizeApi.create({ name });

      setSizes((previous) => [
        ...previous,
        response.data,
      ]);

      setSizeName("");
      setSuccess(`Size "${name}" added successfully.`);
    } catch (error) {
      setSizeError(
        getErrorMessage(error, "Unable to add this size.")
      );
    } finally {
      setSavingSize(false);
    }
  };

  return (
    <>
      <Header
        title="Colors & Sizes"
        desc="Manage the color and size options available for product variants."
      >
        <Link className="btn secondary" to="/admin/products">
          View Products
        </Link>
      </Header>

      {success && (
        <div className="color-size-success" role="status">
          {success}
        </div>
      )}

      <div className="color-size-grid">
        <Panel>
          <section className="color-size-section">
            <div className="color-size-heading">
              <div className="color-size-icon">🎨</div>
              <div>
                <h3>Add a Color</h3>
                <p>Choose a name and its display color.</p>
              </div>
            </div>

            <form onSubmit={handleAddColor}>
              <label className="color-size-field">
                Color name *
                <input
                  value={colorName}
                  onChange={(event) =>
                    setColorName(event.target.value)
                  }
                  placeholder="e.g. Baby Pink"
                  maxLength={50}
                  required
                />
              </label>

              <label className="color-size-field">
                Hex color code
                <div className="color-size-picker">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(hexCode)
                      ? hexCode
                      : "#000000"}
                    onChange={(event) =>
                      setHexCode(event.target.value)
                    }
                    aria-label="Choose color"
                  />
                  <input
                    value={hexCode}
                    onChange={(event) =>
                      setHexCode(event.target.value)
                    }
                    placeholder="#F4A6B8"
                    maxLength={7}
                    pattern="^#[0-9a-fA-F]{6}$"
                    title="Enter a six-digit hex code, such as #F4A6B8"
                  />
                </div>
              </label>

              {colorError && (
                <div className="color-size-error" role="alert">
                  {colorError}
                </div>
              )}

              <button
                className="btn"
                type="submit"
                disabled={savingColor}
              >
                {savingColor ? "Adding..." : "+ Add Color"}
              </button>
            </form>

            <div className="color-size-list-heading">
              <h4>Existing Colors</h4>
              <span>{colors.length}</span>
            </div>

            {loading ? (
              <p className="color-size-muted">Loading colors...</p>
            ) : colors.length === 0 ? (
              <p className="color-size-muted">No colors found.</p>
            ) : (
              <div className="color-size-list">
                {colors.map((color) => (
                  <div className="color-size-item" key={color.id}>
                    <span
                      className="color-size-swatch"
                      style={{
                        backgroundColor:
                          /^#[0-9a-fA-F]{6}$/.test(color.hex_code || "")
                            ? color.hex_code
                            : "#e5e7eb",
                      }}
                    />
                    <span>{color.name}</span>
                    <small>{color.hex_code || "No hex code"}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
        </Panel>

        <Panel>
          <section className="color-size-section">
            <div className="color-size-heading">
              <div className="color-size-icon">📏</div>
              <div>
                <h3>Add a Size</h3>
                <p>Create sizes for your product variants.</p>
              </div>
            </div>

            <form onSubmit={handleAddSize}>
              <label className="color-size-field">
                Size name *
                <input
                  value={sizeName}
                  onChange={(event) =>
                    setSizeName(event.target.value)
                  }
                  placeholder="e.g. 3-6M or M"
                  maxLength={10}
                  required
                />
              </label>

              {sizeError && (
                <div className="color-size-error" role="alert">
                  {sizeError}
                </div>
              )}

              <button
                className="btn"
                type="submit"
                disabled={savingSize}
              >
                {savingSize ? "Adding..." : "+ Add Size"}
              </button>
            </form>

            <div className="color-size-list-heading">
              <h4>Existing Sizes</h4>
              <span>{sizes.length}</span>
            </div>

            {loading ? (
              <p className="color-size-muted">Loading sizes...</p>
            ) : sizes.length === 0 ? (
              <p className="color-size-muted">No sizes found.</p>
            ) : (
              <div className="color-size-list">
                {sizes.map((size) => (
                  <div className="color-size-item" key={size.id}>
                    <span className="color-size-size-icon">S</span>
                    <span>{size.name}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </Panel>
      </div>
    </>
  );
}
