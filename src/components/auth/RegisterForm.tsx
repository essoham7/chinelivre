import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  Check,
} from "lucide-react";

interface RegisterFormProps {
  onSuccess?: () => void;
  onToggleForm?: () => void;
}

export function RegisterForm({ onSuccess, onToggleForm }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Le type de compte est fixé à "client" lors de l'inscription
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);

  const { signUp } = useAuthStore();

  // Real-time email validation
  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        setEmailError(null);
        setEmailValid(true);
      } else {
        setEmailError("Format d'email invalide");
        setEmailValid(false);
      }
    } else {
      setEmailError(null);
      setEmailValid(false);
    }
  }, [email]);

  // Password strength calculation
  useEffect(() => {
    if (password) {
      const errors: string[] = [];
      let strength = 0;

      // Length check
      if (password.length >= 8) {
        strength += 25;
      } else {
        errors.push("Au moins 8 caractères");
      }

      // Uppercase check
      if (/[A-Z]/.test(password)) {
        strength += 25;
      } else {
        errors.push("Une majuscule");
      }

      // Lowercase check
      if (/[a-z]/.test(password)) {
        strength += 25;
      } else {
        errors.push("Une minuscule");
      }

      // Number check
      if (/\d/.test(password)) {
        strength += 12.5;
      } else {
        errors.push("Un chiffre");
      }

      // Special character check
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength += 12.5;
      } else {
        errors.push("Un caractère spécial");
      }

      setPasswordStrength(strength);
      setPasswordErrors(errors);
      setPasswordValid(strength === 100);
    } else {
      setPasswordStrength(0);
      setPasswordErrors([]);
      setPasswordValid(false);
    }
  }, [password]);

  // Confirm password validation
  useEffect(() => {
    if (confirmPassword) {
      if (confirmPassword === password) {
        setConfirmPasswordError(null);
        setConfirmPasswordValid(true);
      } else {
        setConfirmPasswordError("Les mots de passe ne correspondent pas");
        setConfirmPasswordValid(false);
      }
    } else {
      setConfirmPasswordError(null);
      setConfirmPasswordValid(false);
    }
  }, [confirmPassword, password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    if (!firstName.trim() || !lastName.trim()) {
      setError("Veuillez entrer votre nom et prénom");
      setLoading(false);
      return;
    }

    if (!emailValid) {
      setError("Veuillez entrer une adresse email valide");
      setLoading(false);
      return;
    }

    if (!passwordValid) {
      setError("Veuillez entrer un mot de passe valide");
      setLoading(false);
      return;
    }

    if (!confirmPasswordValid) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      setLoading(false);
      return;
    }

    try {
      await signUp(
        email,
        password,
        "client",
        firstName.trim(),
        lastName.trim()
      );
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">C</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer un compte
          </h1>
          <p className="text-gray-600">
            Rejoignez notre plateforme de suivi de colis
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* First and Last Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prénom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Jean"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg transition-colors duration-200 ${
                    emailError
                      ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                      : emailValid
                      ? "border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="vous@exemple.com"
                  required
                  aria-invalid={emailError ? "true" : "false"}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                )}
                {emailError && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {emailError && (
                <p id="email-error" className="mt-2 text-sm text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field with Strength Indicator */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-20 py-3 border rounded-lg transition-colors duration-200 ${
                    passwordErrors.length > 0
                      ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                      : passwordValid
                      ? "border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">
                      Force du mot de passe
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {passwordStrength === 0
                        ? "Très faible"
                        : passwordStrength < 50
                        ? "Faible"
                        : passwordStrength < 75
                        ? "Moyenne"
                        : "Forte"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  {passwordErrors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">
                        Doit contenir :
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {passwordErrors.map((error, index) => (
                          <li key={index} className="flex items-center">
                            <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-10 pr-20 py-3 border rounded-lg transition-colors duration-200 ${
                    confirmPasswordError
                      ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                      : confirmPasswordValid
                      ? "border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="••••••••"
                  required
                  aria-invalid={confirmPasswordError ? "true" : "false"}
                  aria-describedby={
                    confirmPasswordError ? "confirm-password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                {confirmPasswordValid && (
                  <div className="absolute inset-y-0 right-0 pr-10 flex items-center">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                )}
                {confirmPasswordError && (
                  <div className="absolute inset-y-0 right-0 pr-10 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {confirmPasswordError && (
                <p
                  id="confirm-password-error"
                  className="mt-2 text-sm text-red-600"
                >
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="accept-terms" className="text-gray-700">
                  J'accepte les{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-500 underline"
                    onClick={() => console.log("Conditions d'utilisation")}
                  >
                    conditions d'utilisation
                  </button>{" "}
                  et la{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-500 underline"
                    onClick={() => console.log("Politique de confidentialité")}
                  >
                    politique de confidentialité
                  </button>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !firstName.trim() ||
                !lastName.trim() ||
                !emailValid ||
                !passwordValid ||
                !confirmPasswordValid ||
                !acceptTerms
              }
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                "Créer un compte"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={onToggleForm}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
