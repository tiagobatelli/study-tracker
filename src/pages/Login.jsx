import { setPersistence, browserSessionPersistence } from "firebase/auth";
import { useTheme } from "../contexts/ThemeContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { dark, toggleTheme } = useTheme();

  async function handleSubmit() {
    setError("");
    setSuccess("");
    try {
      if (!rememberMe) {
      await setPersistence(auth, browserSessionPersistence);
      }
      if (isRegister) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        setSuccess("Conta criada! Verifique seu e-mail antes de entrar.");
        return;
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          setError("E-mail não verificado. Verifique sua caixa de entrada.");
          return;
        }
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReset() {
    setError("");
    setSuccess("");
    if (!resetEmail) {
      setError("Digite seu e-mail para redefinir a senha.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccess("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
      setShowReset(false);
      setResetEmail("");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  function handleResetKeyDown(e) {
    if (e.key === "Enter") handleReset();
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="lang-toggle">
          <button onClick={() => i18n.changeLanguage("en")}>EN</button>
          <button onClick={() => i18n.changeLanguage("pt")}>PT</button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>

        <h1>{t("app_name")}</h1>
        <h2>{t("login.title")}</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {!showReset ? (
          <>
            <input
              type="email"
              placeholder={t("login.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("login.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </span>
            </div>

            {!isRegister && (
              <span
                className="link forgot-password"
                onClick={() => { setShowReset(true); setError(""); setSuccess(""); }}
              >
                {t("login.forgot_password")}
              </span>
            )}

            <label className="remember-me">
              <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              />
              {t("login.remember_me")}
            </label>

            <button className="btn-primary" onClick={handleSubmit}>
              {isRegister ? t("login.btn_register") : t("login.btn_login")}
            </button>

            <p>
              {isRegister ? t("login.have_account") : t("login.no_account")}{" "}
              <span
                className="link"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setEmail("");
                  setPassword("");
                  setError("");
                  setSuccess("");
                }}
              >
                {isRegister ? t("login.btn_login") : t("login.btn_register")}
              </span>
            </p>
          </>
        ) : (
          <>
            <p style={{ color: "#aaa", fontSize: "0.95rem" }}>
              {t("login.reset_instructions")}
            </p>
            <input
              type="email"
              placeholder={t("login.email")}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              onKeyDown={handleResetKeyDown}
              autoComplete="email"
            />
            <button className="btn-primary" onClick={handleReset}>
              {t("login.btn_reset")}
            </button>
            <span
              className="link"
              onClick={() => { setShowReset(false); setError(""); setSuccess(""); }}
            >
              {t("login.back_to_login")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}