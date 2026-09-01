import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthApi } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await adminAuthApi.login(
        email.trim(),
        password
      );

      const {
        access,
        refresh,
        user,
      } = response.data;

      // Store authentication
      localStorage.setItem(
        "access_token",
        access
      );

      localStorage.setItem(
        "refresh_token",
        refresh
      );

      localStorage.setItem(
        "admin_user",
        JSON.stringify(user)
      );

      // Go to admin dashboard
      navigate("/admin", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "ADMIN LOGIN ERROR:",
        error.response?.data || error
      );

      const message =
        error.response?.data?.detail ||
        "Unable to sign in. Please check your credentials.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">

      <div className="login-card">

        {/* Brand */}

        <div className="loginbrand">
          <span className="login-logo">
            🐹
          </span>

          <div>
            <b>Capybara</b>
            <small>Admin Panel</small>
          </div>
        </div>


        {/* Heading */}

        <div className="login-heading">

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to manage your store.
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}


        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="login-form"
        >

          {/* Email */}

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </label>


          {/* Password */}

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
          </label>


          {/* Submit */}

          <button
            type="submit"
            className="btn full login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        {/* Footer */}

        <div className="login-footer">
          <span>
            Authorized administrators only
          </span>
        </div>

      </div>

    </div>
  );
}