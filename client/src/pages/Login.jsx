import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import loginIllustration from "../assets/illustrations/LoginIllustration.jpg";
import visibilityIcon from "../assets/icons/visibility.svg"
import visibilityOffIcon from "../assets/icons/visibilityOff.svg"

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("[Login] Submitting login form");
      const response = await login(formData);
      const role = response.user.role;

      toast.success("Login successful!");
      console.log("[Login] Navigating to dashboard:", role);

      // Navigate based on role
      if (role === "student") navigate("/student/dashboard", { replace: true });
      else if (role === "teacher")
        navigate("/teacher/dashboard", { replace: true });
      else if (role === "admin")
        navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("[Login] Login error:", err.message);
      toast.error(
        "Login failed - " + (err.message || "Please check your credentials"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={loginIllustration} className="loginIllustration" alt="" />
          {/* <svg className="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg> */}
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="pwd-input">
                <input
                  type={visibility ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter your password"
                />
                <img
                  src={visibility ? visibilityIcon : visibilityOffIcon}
                  onClick={() => setVisibility(!visibility)}
                  alt="show/hide password"
                  className="visibility-icon"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
