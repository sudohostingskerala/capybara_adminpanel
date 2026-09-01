import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Header, Panel, Button } from "../components/UI";

import {
  categoryApi,
  colorApi,
  sizeApi,
  productAdminApi,
} from "../services/api";


// =========================================================
// HELPERS
// =========================================================

const createLocalId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
};


const createColor = () => ({
  id: createLocalId(),
  color: "",
  images: [],
});


const createVariant = () => ({
  id: createLocalId(),
  color: "",
  size: "",
  sku: "",
  price: "",
  discount_price: "",
  stock: 0,
  availability_status: "IN_STOCK",
});


// =========================================================
// COMPONENT
// =========================================================

export default function ProductForm() {

  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);


  // =========================================================
  // LOADING
  // =========================================================

  const [loadingProduct, setLoadingProduct] =
    useState(isEditMode);


  const [saving, setSaving] =
    useState(false);


  const [pageError, setPageError] =
    useState("");


  // =========================================================
  // CATEGORIES
  // =========================================================

  const [categories, setCategories] =
    useState([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [categoryError, setCategoryError] =
    useState("");


  // =========================================================
  // COLORS
  // =========================================================

  const [colors, setColors] =
    useState([]);

  const [colorsLoading, setColorsLoading] =
    useState(true);

  const [colorError, setColorError] =
    useState("");


  // =========================================================
  // SIZES
  // =========================================================

  const [sizes, setSizes] =
    useState([]);

  const [sizesLoading, setSizesLoading] =
    useState(true);

  const [sizeError, setSizeError] =
    useState("");


  // =========================================================
  // PRODUCT
  // =========================================================

  const [product, setProduct] =
    useState({
      name: "",
      slug: "",
      search_keywords: "",
      category: "",
      description: "",
      material: "",
      care_instruction: "",
      is_featured: false,
      is_active: true,
    });


  // =========================================================
  // PRODUCT COLORS
  // =========================================================

  const [productColors, setProductColors] =
    useState([]);


  // =========================================================
  // VARIANTS
  // =========================================================

  const [variants, setVariants] =
    useState([]);


  // =========================================================
  // EXISTING IMAGES TO DELETE
  // =========================================================

  const [deletedImageIds, setDeletedImageIds] =
    useState([]);

  const [deletedVariantIds, setDeletedVariantIds] = useState([]);


  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  useEffect(() => {

    const loadCategories = async () => {

      try {

        setCategoriesLoading(true);
        setCategoryError("");

        const response =
          await categoryApi.list();

        const data =
          Array.isArray(response.data)
            ? response.data
            : response.data?.results || [];

        setCategories(data);

      } catch (error) {

        console.error(
          "CATEGORY API ERROR:",
          error.response?.data || error
        );

        setCategoryError(
          "Unable to load categories."
        );

      } finally {

        setCategoriesLoading(false);

      }
    };


    loadCategories();

  }, []);


  // =========================================================
  // LOAD COLORS + SIZES
  // =========================================================

  useEffect(() => {

    const loadColorsAndSizes = async () => {

      try {

        setColorsLoading(true);
        setSizesLoading(true);

        setColorError("");
        setSizeError("");


        const [
          colorsResponse,
          sizesResponse,
        ] = await Promise.all([
          colorApi.list(),
          sizeApi.list(),
        ]);


        const colorData =
          Array.isArray(colorsResponse.data)
            ? colorsResponse.data
            : colorsResponse.data?.results || [];


        const sizeData =
          Array.isArray(sizesResponse.data)
            ? sizesResponse.data
            : sizesResponse.data?.results || [];


        setColors(colorData);
        setSizes(sizeData);


      } catch (error) {

        console.error(
          "COLOR/SIZE API ERROR:",
          error.response?.data || error
        );


        setColorError(
          "Unable to load colors."
        );


        setSizeError(
          "Unable to load sizes."
        );


      } finally {

        setColorsLoading(false);
        setSizesLoading(false);

      }
    };


    loadColorsAndSizes();

  }, []);


  // =========================================================
  // LOAD PRODUCT FOR EDIT
  // =========================================================

  useEffect(() => {

    if (!isEditMode) {

      setProductColors([
        createColor(),
      ]);

      setVariants([
        createVariant(),
      ]);

      setLoadingProduct(false);

      return;
    }


    const loadProduct = async () => {

      try {

        setLoadingProduct(true);
        setPageError("");


        const response =
          await productAdminApi.detail(id);


        console.log(
          "PRODUCT DETAIL FROM BACKEND:",
          response.data
        );


        const data =
          response.data;


        // ---------------------------------------------------
        // PRODUCT BASIC DATA
        // ---------------------------------------------------

        setProduct({
          name:
            data.name || "",

          slug:
            data.slug || "",

          search_keywords:
            data.search_keywords || "",

          category:
            data.category !== null &&
            data.category !== undefined
              ? String(data.category)
              : "",

          description:
            data.description || "",

          material:
            data.material || "",

          care_instruction:
            data.care_instruction || "",

          is_featured:
            Boolean(
              data.is_featured
            ),

          is_active:
            data.is_active !== false,
        });


        // ---------------------------------------------------
        // COLORS
        // ---------------------------------------------------

        const backendColors =
          Array.isArray(data.colors)
            ? data.colors
            : [];


        const mappedColors =
          backendColors.map(
            (productColor) => {

              const colorId =
                productColor.color;


              const images =
                Array.isArray(
                  productColor.images
                )
                  ? productColor.images.map(
                      (image) => ({
                        id:
                          image.id,

                        preview:
                          image.image,

                        image:
                          image.image,

                        existing:
                          true,

                        file:
                          null,

                        is_primary:
                          Boolean(
                            image.is_primary
                          ),

                        display_order:
                          image.display_order ??
                          0,
                      })
                    )
                  : [];


              return {
                id:
                  productColor.id ||
                  createLocalId(),

                color:
                  colorId !== null &&
                  colorId !== undefined
                    ? String(colorId)
                    : "",

                images,
              };

            }
          );


        setProductColors(
          mappedColors.length
            ? mappedColors
            : [createColor()]
        );


        // ---------------------------------------------------
        // VARIANTS
        // ---------------------------------------------------

        const backendVariants =
          Array.isArray(data.variants)
            ? data.variants
            : [];


        const mappedVariants =
          backendVariants.map(
            (variant) => ({

              id:
                variant.id ||
                createLocalId(),

              color:
                variant.color !== null &&
                variant.color !== undefined
                  ? String(
                      variant.color
                    )
                  : "",

              size:
                variant.size !== null &&
                variant.size !== undefined
                  ? String(
                      variant.size
                    )
                  : "",

              sku:
                variant.sku || "",

              price:
                variant.price ?? "",

              discount_price:
                variant.discount_price ??
                "",

              stock:
                variant.stock ?? 0,

              availability_status:
                variant.availability_status ||
                "IN_STOCK",

            })
          );


        setVariants(
          mappedVariants.length
            ? mappedVariants
            : [createVariant()]
        );


        setDeletedImageIds([]);
        setDeletedVariantIds([]);


      } catch (error) {

        console.error(
          "PRODUCT DETAIL ERROR:",
          error.response?.data ||
            error
        );


        setPageError(
          error.response?.data?.detail ||
          "Unable to load product."
        );


      } finally {

        setLoadingProduct(false);

      }
    };


    loadProduct();

  }, [id, isEditMode]);


  // =========================================================
  // PRODUCT HANDLERS
  // =========================================================

  const updateProduct = (
    field,
    value
  ) => {

    setProduct(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

  };


  // =========================================================
  // COLOR HANDLERS
  // =========================================================

  const addColor = () => {

    setProductColors(
      (previous) => [
        ...previous,
        createColor(),
      ]
    );

  };


  const removeColor = (
    colorId
  ) => {

    if (
      productColors.length === 1
    ) {

      return;

    }


    const removedColor =
      productColors.find(
        (color) =>
          color.id === colorId
      );


    setProductColors(
      (previous) =>
        previous.filter(
          (color) =>
            color.id !== colorId
        )
    );


    if (removedColor?.color) {

      setVariants(
        (previous) =>
          previous.filter(
            (variant) =>
              String(
                variant.color
              ) !==
              String(
                removedColor.color
              )
          )
      );

    }

  };


  const updateColor = (
    colorId,
    value
  ) => {

    setProductColors(
      (previous) =>
        previous.map(
          (color) =>
            color.id === colorId
              ? {
                  ...color,
                  color: value,
                }
              : color
        )
    );

  };


// =========================================================
// ADD NEW IMAGES
// =========================================================

const handleColorImages = (colorId, files) => {
  const selectedFiles = Array.from(files || []);

  if (!selectedFiles.length) return;

  const imageObjects = selectedFiles.map((file) => ({
    id: createLocalId(),
    file,
    preview: URL.createObjectURL(file),
    existing: false,
    is_primary: false,
    display_order: 0,
  }));

  setProductColors((previous) =>
    previous.map((color) =>
      color.id === colorId
        ? {
            ...color,
            images: [
              ...color.images,
              ...imageObjects,
            ],
          }
        : color
    )
  );
};


// =========================================================
// DELETE IMAGE
// =========================================================

const removeColorImage = (colorId, imageId) => {
  // Find the image BEFORE changing state
  const color = productColors.find(
    (item) => item.id === colorId
  );

  const removedImage = color?.images.find(
    (image) =>
      String(image.id) === String(imageId)
  );

  if (!removedImage) return;

  // Remove from UI
  setProductColors((previous) =>
    previous.map((item) =>
      item.id === colorId
        ? {
            ...item,
            images: item.images.filter(
              (image) =>
                String(image.id) !==
                String(imageId)
            ),
          }
        : item
    )
  );

  // Existing database image
  if (
    removedImage.existing &&
    removedImage.id
  ) {
    setDeletedImageIds((previous) => {
      if (
        previous.includes(
          removedImage.id
        )
      ) {
        return previous;
      }

      return [
        ...previous,
        removedImage.id,
      ];
    });
  }

  // Local image
  if (
    removedImage.file &&
    removedImage.preview
  ) {
    URL.revokeObjectURL(
      removedImage.preview
    );
  }
};


// =========================================================
// REPLACE EXISTING IMAGE
// =========================================================

const replaceColorImage = (
  colorId,
  imageId,
  file
) => {
  if (!file) return;

  // Find old image BEFORE changing state
  const color = productColors.find(
    (item) => item.id === colorId
  );

  const oldImage = color?.images.find(
    (image) =>
      String(image.id) ===
      String(imageId)
  );

  if (!oldImage) return;

  const newImage = {
    id: createLocalId(),

    file,

    preview:
      URL.createObjectURL(file),

    existing: false,

    // Preserve primary state
    is_primary:
      Boolean(oldImage.is_primary),

    display_order:
      oldImage.display_order ?? 0,
  };

  // Replace image in UI
  setProductColors((previous) =>
    previous.map((item) =>
      item.id === colorId
        ? {
            ...item,

            images: item.images.map(
              (image) =>
                String(image.id) ===
                String(imageId)
                  ? newImage
                  : image
            ),
          }
        : item
    )
  );

  // Tell backend to delete old image
  if (
    oldImage.existing &&
    oldImage.id
  ) {
    setDeletedImageIds((previous) => {
      if (
        previous.includes(
          oldImage.id
        )
      ) {
        return previous;
      }

      return [
        ...previous,
        oldImage.id,
      ];
    });
  }

  // Clean up old local preview
  if (
    oldImage.file &&
    oldImage.preview
  ) {
    URL.revokeObjectURL(
      oldImage.preview
    );
  }
};

// =========================================================
// SET PRIMARY IMAGE
// =========================================================

const setPrimaryImage = (
  colorId,
  imageId
) => {
  setProductColors((previous) =>
    previous.map((color) =>
      color.id === colorId
        ? {
            ...color,

            images: color.images.map(
              (image) => ({
                ...image,

                is_primary:
                  String(image.id) ===
                  String(imageId),
              })
            ),
          }
        : color
    )
  );
};


  // =========================================================
  // VARIANT HANDLERS
  // =========================================================

  const addVariant = () => {

    setVariants(
      (previous) => [
        ...previous,
        createVariant(),
      ]
    );

  };


  const removeVariant = (variantId) => {
  // Don't allow removing the final variant
  if (variants.length === 1) {
    return;
  }

  const removedVariant = variants.find(
    (variant) =>
      String(variant.id) === String(variantId)
  );

  if (!removedVariant) {
    return;
  }

  // Remove from UI
  setVariants((previous) =>
    previous.filter(
      (variant) =>
        String(variant.id) !==
        String(variantId)
    )
  );

  // If this is an existing database variant,
  // tell the backend to delete it.
  if (
    typeof removedVariant.id === "number"
  ) {
    setDeletedVariantIds((previous) => {
      if (
        previous.includes(
          removedVariant.id
        )
      ) {
        return previous;
      }

      return [
        ...previous,
        removedVariant.id,
      ];
    });
  }
};


  const updateVariant = (
    variantId,
    field,
    value
  ) => {

    setVariants(
      (previous) =>
        previous.map(
          (variant) =>
            String(
              variant.id
            ) ===
            String(
              variantId
            )
              ? {
                  ...variant,
                  [field]: value,
                }
              : variant
        )
    );

  };


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (saving) {

      return;

    }


    try {

      setSaving(true);


      // -----------------------------------------------------
      // BASIC VALIDATION
      // -----------------------------------------------------

      if (!product.name.trim()) {

        alert(
          "Please enter a product name."
        );

        return;

      }


      if (!product.category) {

        alert(
          "Please select a category."
        );

        return;

      }


      if (
        productColors.length ===
        0
      ) {

        alert(
          "Please add at least one color."
        );

        return;

      }


      const invalidColor =
        productColors.find(
          (item) =>
            !item.color
        );


      if (invalidColor) {

        alert(
          "Please select a color for every color section."
        );

        return;

      }


      if (
        variants.length ===
        0
      ) {

        alert(
          "Please add at least one variant."
        );

        return;

      }


      const invalidVariant =
        variants.find(
          (variant) =>
            !variant.color ||
            !variant.size ||
            !variant.sku ||
            variant.price === ""
        );


      if (invalidVariant) {

        alert(
          "Please complete color, size, SKU and price for every variant."
        );

        return;

      }


      // -----------------------------------------------------
      // FORM DATA
      // -----------------------------------------------------

      const formData =
        new FormData();


      // -----------------------------------------------------
      // BASIC PRODUCT DATA
      // -----------------------------------------------------

      formData.append(
        "name",
        product.name
      );


      formData.append(
        "slug",
        product.slug
      );


      formData.append(
        "search_keywords",
        product.search_keywords
      );


      formData.append(
        "description",
        product.description
      );


      formData.append(
        "material",
        product.material
      );


      formData.append(
        "care_instruction",
        product.care_instruction
      );


      formData.append(
        "is_featured",
        String(
          product.is_featured
        )
      );


      formData.append(
        "is_active",
        String(
          product.is_active
        )
      );


      formData.append(
        "category",
        String(
          product.category
        )
      );


      // -----------------------------------------------------
      // COLORS
      // -----------------------------------------------------

      const colorsData =
        productColors.map(
          (productColor) => ({
            id:
              typeof productColor.id ===
              "number"
                ? productColor.id
                : undefined,

            color:
              Number(
                productColor.color
              ),
          })
        );


      formData.append(
        "colors",
        JSON.stringify(
          colorsData
        )
      );

      // -----------------------------------------------------
      // DELETED EXISTING VARIANTS
      // -----------------------------------------------------

        if (
            isEditMode &&
            deletedVariantIds.length > 0
        ) {
            formData.append(
                "deleted_variant_ids",
                JSON.stringify(
                    deletedVariantIds
                )
            );
        }


      // -----------------------------------------------------
      // VARIANTS
      // -----------------------------------------------------

      const variantsData =
        variants.map(
          (variant) => {

            const item = {
              id:
                typeof variant.id ===
                "number"
                  ? variant.id
                  : undefined,

              color:
                Number(
                  variant.color
                ),

              size:
                Number(
                  variant.size
                ),

              sku:
                variant.sku,

              price:
                variant.price,

              discount_price:
                variant.discount_price ||
                null,

              stock:
                Number(
                  variant.stock || 0
                ),

              availability_status:
                variant.availability_status,
            };


            // Don't send undefined IDs
            if (
              item.id ===
              undefined
            ) {

              delete item.id;

            }


            return item;

          }
        );


      formData.append(
        "variants",
        JSON.stringify(
          variantsData
        )
      );


      // -----------------------------------------------------
      // DELETED EXISTING IMAGES
      // -----------------------------------------------------

      if (
        isEditMode &&
        deletedImageIds.length >
          0
      ) {

        formData.append(
          "deleted_image_ids",
          JSON.stringify(
            deletedImageIds
          )
        );

      }


      // -----------------------------------------------------
      // NEW IMAGES
      // -----------------------------------------------------

      productColors.forEach(
        (
          productColor,
          colorIndex
        ) => {

          productColor.images.forEach(
            (image) => {

              if (
                image.file
              ) {

                formData.append(
                  `color_${colorIndex}_images`,
                  image.file
                );

              }

            }
          );

        }
      );


      // -----------------------------------------------------
      // DEBUG
      // -----------------------------------------------------

      console.log(
        isEditMode
          ? "UPDATING PRODUCT..."
          : "CREATING PRODUCT..."
      );


      for (
        const [
          key,
          value,
        ] of formData.entries()
      ) {

        console.log(
          key,
          value
        );

      }


      // -----------------------------------------------------
      // API
      // -----------------------------------------------------

      let response;


      if (isEditMode) {

        response =
          await productAdminApi.update(
            id,
            formData
          );

      } else {

        response =
          await productAdminApi.create(
            formData
          );

      }


      console.log(
        isEditMode
          ? "PRODUCT UPDATED:"
          : "PRODUCT CREATED:",
        response.data
      );


      alert(
        isEditMode
          ? "Product updated successfully!"
          : "Product created successfully!"
      );


      navigate(
        "/admin/products"
      );


    } catch (error) {

      console.error(
        isEditMode
          ? "PRODUCT UPDATE ERROR:"
          : "PRODUCT CREATE ERROR:",
        error.response?.data ||
          error
      );


      const backendError =
        error.response?.data;


      if (
        backendError?.detail
      ) {

        alert(
          backendError.detail
        );

      } else if (
        backendError &&
        typeof backendError ===
          "object"
      ) {

        alert(
          Object.entries(
            backendError
          )
            .map(
              ([
                field,
                message,
              ]) =>
                `${field}: ${
                  Array.isArray(
                    message
                  )
                    ? message.join(
                        ", "
                      )
                    : message
                }`
            )
            .join("\n")
        );

      } else {

        alert(
          isEditMode
            ? "Failed to update product."
            : "Failed to create product."
        );

      }

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // SUMMARY
  // =========================================================

  const totalStock =
    variants.reduce(
      (
        total,
        variant
      ) =>
        total +
        Number(
          variant.stock || 0
        ),
      0
    );


  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (
    loadingProduct
  ) {

    return (
      <>

        <Header
          title="Edit Product"
          desc="Loading product information..."
        />

        <Panel>

          <div className="empty-state">
            Loading product...
          </div>

        </Panel>

      </>
    );

  }


  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (
    pageError
  ) {

    return (
      <>

        <Header
          title="Edit Product"
          desc="Unable to load this product."
        />

        <Panel>

          <div className="empty-state">

            <p>
              {pageError}
            </p>


            <Button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
            >
              Back to Products
            </Button>

          </div>

        </Panel>

      </>

    );

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="product-form-page">

      <Header
        title={
          isEditMode
            ? "Edit Product"
            : "Add Product"
        }

        desc={
          isEditMode
            ? "Update product information, colors, images and variants."
            : "Create a product and configure its colors, images and variants."
        }
      />


      <form
        onSubmit={
          handleSubmit
        }
      >

        {/* =================================================
            BASIC INFORMATION
            ================================================= */}

        <div className="product-basic-grid">

          <Panel>

            <div className="product-panel">

              <h3>
                Basic Information
              </h3>

              <span className="panel-subtitle">
                General information about this product.
              </span>


              <div className="product-fields two">

                <label>

                  Product Name *

                  <input
                    required
                    type="text"
                    value={
                      product.name
                    }

                    onChange={(
                      event
                    ) =>
                      updateProduct(
                        "name",
                        event.target.value
                      )
                    }

                    placeholder="Enter product name"
                  />

                </label>


                <label>

                  Slug

                  <input
                    type="text"
                    value={
                      product.slug
                    }

                    onChange={(
                      event
                    ) =>
                      updateProduct(
                        "slug",
                        event.target.value
                      )
                    }

                    placeholder="product-slug"
                  />

                </label>

              </div>


              {/* SEARCH KEYWORDS */}

              <label>

                Search Keywords

                <input
                  type="text"
                  value={
                    product.search_keywords
                  }

                  onChange={(
                    event
                  ) =>
                    updateProduct(
                      "search_keywords",
                      event.target.value
                    )
                  }

                  placeholder="hoodie, black hoodie, capybara hoodie"
                />

                <small className="product-field-help">
                  Enter comma-separated keywords used for product search.
                </small>

              </label>


              {/* CATEGORY */}

              <label>

                Category *

                <select
                  required
                  value={
                    product.category
                  }

                  onChange={(
                    event
                  ) =>
                    updateProduct(
                      "category",
                      event.target.value
                    )
                  }

                  disabled={
                    categoriesLoading
                  }
                >

                  <option value="">

                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select category"}

                  </option>


                  {categories.map(
                    (category) => (

                      <option
                        key={
                          category.id
                        }

                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>

                    )
                  )}

                </select>


                {categoryError && (

                  <small
                    className="product-field-help"
                    style={{
                      color:
                        "#d9534f",
                    }}
                  >
                    {
                      categoryError
                    }
                  </small>

                )}

              </label>


              {/* DESCRIPTION */}

              <label>

                Description *

                <textarea
                  required
                  rows="5"

                  value={
                    product.description
                  }

                  onChange={(
                    event
                  ) =>
                    updateProduct(
                      "description",
                      event.target.value
                    )
                  }

                  placeholder="Describe your product..."
                />

              </label>


              <div className="product-fields two">

                <label>

                  Material

                  <input
                    type="text"
                    value={
                      product.material
                    }

                    onChange={(
                      event
                    ) =>
                      updateProduct(
                        "material",
                        event.target.value
                      )
                    }

                    placeholder="Cotton, Silk, Denim..."
                  />

                </label>


                <label>

                  Care Instructions

                  <input
                    type="text"
                    value={
                      product.care_instruction
                    }

                    onChange={(
                      event
                    ) =>
                      updateProduct(
                        "care_instruction",
                        event.target.value
                      )
                    }

                    placeholder="Machine wash cold..."
                  />

                </label>

              </div>

            </div>

          </Panel>


          {/* =================================================
              SETTINGS
              ================================================= */}

          <Panel>

            <div className="product-panel">

              <h3>
                Product Settings
              </h3>

              <span className="panel-subtitle">
                Control how this product appears in the store.
              </span>


              <div className="product-setting">

                <label className="product-toggle">

                  <div className="product-toggle-text">

                    <strong>
                      Active Product
                    </strong>

                    <small>
                      Product will be visible
                      in the store.
                    </small>

                  </div>


                  <input
                    type="checkbox"
                    checked={
                      product.is_active
                    }

                    onChange={(
                      event
                    ) =>
                      updateProduct(
                        "is_active",
                        event.target.checked
                      )
                    }
                  />


                  <span className="product-toggle-ui" />

                </label>


                <label className="product-toggle">

                  <div className="product-toggle-text">

                    <strong>
                      Featured Product
                    </strong>

                    <small>
                      Show this product in
                      the featured collection.
                    </small>

                  </div>


                  <input
                    type="checkbox"
                    checked={
                      product.is_featured
                    }

                    onChange={(
                      event
                    ) =>
                      updateProduct(
                        "is_featured",
                        event.target.checked
                      )
                    }
                  />


                  <span className="product-toggle-ui" />

                </label>

              </div>


              <div className="product-summary">

                <h4 className="product-summary-title">
                  Product Summary
                </h4>


                <div className="product-summary-row">

                  <span>
                    Colors
                  </span>

                  <strong>
                    {
                      productColors.length
                    }
                  </strong>

                </div>


                <div className="product-summary-row">

                  <span>
                    Variants
                  </span>

                  <strong>
                    {
                      variants.length
                    }
                  </strong>

                </div>


                <div className="product-summary-row">

                  <span>
                    Total Stock
                  </span>

                  <strong>
                    {totalStock}
                  </strong>

                </div>


                <div className="product-summary-row">

                  <span>
                    Status
                  </span>

                  <strong>
                    {
                      product.is_active
                        ? "Active"
                        : "Inactive"
                    }
                  </strong>

                </div>

              </div>

            </div>

          </Panel>

        </div>


        {/* =================================================
            COLORS & IMAGES
            ================================================= */}

        <section className="product-colors-section">

          <div className="product-section-heading">

            <div>

              <h2>
                Product Colors & Images
              </h2>

              <p>
                Add colors and upload images.
                Images are shared across all sizes
                of the same color.
              </p>

            </div>


            <Button
              type="button"
              onClick={
                addColor
              }
            >
              ＋ Add Color
            </Button>

          </div>


          {productColors.map(
            (
              productColor,
              index
            ) => (

              <Panel
                key={
                  productColor.id
                }

                className="color-card"
              >

                <div className="color-card-header">

                  <div className="color-card-title">

                    <span className="color-number">
                      {index + 1}
                    </span>


                    <div>

                      <strong>
                        Color{" "}
                        {index + 1}
                      </strong>

                      <small>

                        {productColor.color
                          ? colors.find(
                              (color) =>
                                String(
                                  color.id
                                ) ===
                                String(
                                  productColor.color
                                )
                            )?.name ||
                            "Selected color"
                          : "Select a color"}

                      </small>

                    </div>

                  </div>


                  {productColors.length >
                    1 && (

                    <button
                      type="button"
                      className="remove-color"

                      onClick={() =>
                        removeColor(
                          productColor.id
                        )
                      }
                    >
                      🗑 Remove
                    </button>

                  )}

                </div>


                {/* COLOR */}

                <label>

                  Color *

                  <select
                    required

                    value={
                      productColor.color
                    }

                    onChange={(
                      event
                    ) =>
                      updateColor(
                        productColor.id,
                        event.target.value
                      )
                    }

                    disabled={
                      colorsLoading
                    }
                  >

                    <option value="">

                      {colorsLoading
                        ? "Loading colors..."
                        : "Select color"}

                    </option>


                    {colors.map(
                      (color) => (

                        <option
                          key={
                            color.id
                          }

                          value={
                            color.id
                          }
                        >
                          {
                            color.name
                          }
                        </option>

                      )
                    )}

                  </select>


                  {colorError && (

                    <small
                      className="product-field-help"
                      style={{
                        color:
                          "#d9534f",
                      }}
                    >
                      {
                        colorError
                      }
                    </small>

                  )}

                </label>


                {/* IMAGES */}

                <div className="color-images">

                  <div className="color-images-heading">

                    <div>

                      <h4>
                        Color Images
                      </h4>

                      <p>
                        These images apply to
                        every size of this color.
                      </p>

                    </div>

                  </div>


                  <label className="image-dropzone">

                    <span className="image-upload-icon">
                      ↑
                    </span>

                    <strong>
                      Drop images here
                    </strong>

                    <small>
                      or click to browse
                    </small>


                    <input
                      hidden
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"

                      onChange={(
                        event
                      ) =>
                        handleColorImages(
                          productColor.id,
                          event.target.files
                        )
                      }
                    />

                  </label>


                  {productColor.images.length >
                    0 && (

                    <div className="color-image-grid">

                      {productColor.images.map(
                        (image) => (

                          <div
                            key={
                              image.id
                            }

                            className={`color-image-card ${
                              image.is_primary
                                ? "primary"
                                : ""
                            }`}
                          >

                            <img
                              src={
                                image.preview
                              }

                              alt="Product"
                            />


                            {image.is_primary && (

                              <span className="primary-image-tag">
                                ★ Primary
                              </span>

                            )}


                            <div className="color-image-actions">

  {!image.is_primary && (
    <button
      type="button"
      className="image-action primary-action"
      onClick={() =>
        setPrimaryImage(
          productColor.id,
          image.id
        )
      }
      title="Set as primary image"
    >
      ★
      <span>Primary</span>
    </button>
  )}

  <label
    className="image-action replace-action"
    title="Replace image"
  >
    ↻
    <span>Replace</span>

    <input
      type="file"
      accept="image/png,image/jpeg,image/webp"
      onChange={(event) => {
        const file =
          event.target.files?.[0];

        if (file) {
          replaceColorImage(
            productColor.id,
            image.id,
            file
          );
        }

        event.target.value = "";
      }}
    />
  </label>

  <button
    type="button"
    className="image-action delete-action"
    title="Delete image"
    onClick={() =>
      removeColorImage(
        productColor.id,
        image.id
      )
    }
  >
    🗑
  </button>

</div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              </Panel>

            )
          )}

        </section>


        {/* =================================================
            VARIANTS
            ================================================= */}

        <section className="product-variants-section">

          <div className="product-section-heading">

            <div>

              <h2>
                Product Variants
              </h2>

              <p>
                Each variant represents one
                color and size combination.
              </p>

            </div>


            <Button
              type="button"
              onClick={
                addVariant
              }
            >
              ＋ Add Variant
            </Button>

          </div>


          {variants.map(
            (
              variant,
              index
            ) => (

              <Panel
                key={
                  variant.id
                }

                className="variant-card-new"
              >

                <div className="variant-card-new-header">

                  <div className="variant-title-new">

                    <span className="variant-number-new">
                      {index + 1}
                    </span>


                    <div>

                      <strong>
                        Variant{" "}
                        {index + 1}
                      </strong>

                      <small>

                        {variant.color
                          ? colors.find(
                              (color) =>
                                String(
                                  color.id
                                ) ===
                                String(
                                  variant.color
                                )
                            )?.name ||
                            "Color"
                          : "Color"}

                        {" "}

                        {variant.size
                          ? `• ${
                              sizes.find(
                                (size) =>
                                  String(
                                    size.id
                                  ) ===
                                  String(
                                    variant.size
                                  )
                              )?.name ||
                              variant.size
                            }`
                          : ""}

                      </small>

                    </div>

                  </div>


                  {variants.length >
                    1 && (

                    <button
                      type="button"
                      className="remove-color"

                      onClick={() =>
                        removeVariant(
                          variant.id
                        )
                      }
                    >
                      🗑 Remove
                    </button>

                  )}

                </div>


                <div className="variant-form-body">

                  {/* COLOR + SIZE */}

                  <div className="product-fields two">

                    <label>

                      Color *

                      <select
                        required

                        value={
                          variant.color
                        }

                        onChange={(
                          event
                        ) =>
                          updateVariant(
                            variant.id,
                            "color",
                            event.target.value
                          )
                        }

                        disabled={
                          colorsLoading
                        }
                      >

                        <option value="">

                          {colorsLoading
                            ? "Loading colors..."
                            : "Select color"}

                        </option>


                        {productColors
                          .filter(
                            (
                              productColor
                            ) =>
                              productColor.color
                          )
                          .map(
                            (
                              productColor
                            ) => {

                              const color =
                                colors.find(
                                  (
                                    item
                                  ) =>
                                    String(
                                      item.id
                                    ) ===
                                    String(
                                      productColor.color
                                    )
                                );


                              return (

                                <option
                                  key={
                                    productColor.id
                                  }

                                  value={
                                    productColor.color
                                  }
                                >
                                  {
                                    color?.name ||
                                    "Unknown color"
                                  }
                                </option>

                              );

                            }
                          )}

                      </select>

                    </label>


                    <label>

                      Size *

                      <select
                        required

                        value={
                          variant.size
                        }

                        onChange={(
                          event
                        ) =>
                          updateVariant(
                            variant.id,
                            "size",
                            event.target.value
                          )
                        }

                        disabled={
                          sizesLoading
                        }
                      >

                        <option value="">

                          {sizesLoading
                            ? "Loading sizes..."
                            : "Select size"}

                        </option>


                        {sizes.map(
                          (size) => (

                            <option
                              key={
                                size.id
                              }

                              value={
                                size.id
                              }
                            >
                              {
                                size.name
                              }
                            </option>

                          )
                        )}

                      </select>


                      {sizeError && (

                        <small
                          className="product-field-help"
                          style={{
                            color:
                              "#d9534f",
                          }}
                        >
                          {
                            sizeError
                          }
                        </small>

                      )}

                    </label>

                  </div>


                  {/* SKU / PRICE / DISCOUNT */}

                  <div className="product-fields three">

                    <label>

                      SKU *

                      <input
                        required
                        type="text"

                        value={
                          variant.sku
                        }

                        onChange={(
                          event
                        ) =>
                          updateVariant(
                            variant.id,
                            "sku",
                            event.target.value
                          )
                        }

                        placeholder="CB-PINK-18-001"
                      />

                    </label>


                    <label>

                      Price *

                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"

                        value={
                          variant.price
                        }

                        onChange={(
                          event
                        ) =>
                          updateVariant(
                            variant.id,
                            "price",
                            event.target.value
                          )
                        }

                        placeholder="₹ 0.00"
                      />

                    </label>


                    <label>

                      Discount Price

                      <input
                        type="number"
                        min="0"
                        step="0.01"

                        value={
                          variant.discount_price
                        }

                        onChange={(
                          event
                        ) =>
                          updateVariant(
                            variant.id,
                            "discount_price",
                            event.target.value
                          )
                        }

                        placeholder="₹ 0.00"
                      />

                    </label>

                  </div>


                  {/* STOCK / STATUS */}

                  <div className="product-fields two">

                    <label>

                      Stock *

                      <input
                        required
                        type="number"
                        min="0"

                        value={
                          variant.stock
                        }

                        onChange={(
                          event
                        ) =>
                          updateVariant(
                            variant.id,
                            "stock",
                            event.target.value
                          )
                        }

                      />

                    </label>


                    <label>

                      Availability Status

                      <select
                        value={
                          variant.availability_status
                        }

                        onChange={(
                          event
                        ) =>
                          updateVariant(
                            variant.id,
                            "availability_status",
                            event.target.value
                          )
                        }
                      >

                        <option value="IN_STOCK">
                          In Stock
                        </option>

                        <option value="OUT_OF_STOCK">
                          Out of Stock
                        </option>

                        <option value="COMING_SOON">
                          Coming Soon
                        </option>

                        <option value="DISCONTINUED">
                          Discontinued
                        </option>

                      </select>

                    </label>

                  </div>

                </div>

              </Panel>

            )
          )}


          <button
            type="button"
            className="add-new-variant"

            onClick={
              addVariant
            }
          >
            ＋ Add Another Variant
          </button>

        </section>


        {/* =================================================
            ACTIONS
            ================================================= */}

        <div className="product-form-actions">

          <Button
            secondary
            type="button"

            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
          >
            Cancel
          </Button>


          <Button
            type="submit"
            disabled={saving}
          >

            {saving
              ? (
                isEditMode
                  ? "Saving..."
                  : "Creating..."
              )
              : (
                isEditMode
                  ? "Save Changes"
                  : "Create Product"
              )}

          </Button>

        </div>

      </form>

    </div>
  );
}