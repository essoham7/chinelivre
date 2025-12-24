import { useNavigate } from "react-router-dom";
import {
  Package,
  Globe,
  Truck,
  ArrowRight,
  Search,
  MapPin,
  Calculator,
  Ban,
  Calendar,
} from "lucide-react";
import { InstallPrompt } from "../components/pwa/InstallPrompt";

export function LandingPage() {
  const navigate = useNavigate();

  const heroImg = encodeURIComponent(
    "high-end corporate logistics/aviation scene, cargo plane on runway at dawn, clean composition, premium lighting, deep red accents, charcoal grey, cinematic, professional, minimal, SF Express inspired"
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 inset-x-0 h-16 bg-white/90 backdrop-blur border-b border-gray-200 z-50 transition-all duration-300 px-4 md:px-8">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Package className="h-6 w-6 text-red-700" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              ChineLivre
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-700 transition-colors"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 text-sm font-medium rounded-full bg-red-700 text-white hover:bg-red-800 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero with Track & Trace */}
        <section className="relative min-h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img
              alt="Logistics aviation"
              className="w-full h-full object-cover"
              src={`https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${heroImg}&image_size=landscape_16_9`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 pt-20 pb-32">
            <div className="max-w-2xl animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                L'excellence logistique <br />
                <span className="text-red-500">sans frontières</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-xl leading-relaxed">
                Connectez la Chine à l'Afrique avec une fiabilité
                institutionnelle. Suivi en temps réel et dédouanement simplifié.
              </p>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 md:p-3 border border-white/20 shadow-2xl">
                <div className="bg-white rounded-xl p-2 flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center flex-1 w-full px-3">
                    <Search className="h-5 w-5 text-gray-400 mr-3" />
                    <input
                      placeholder="Entrez votre numéro de suivi (ex: SF123456789CN)"
                      className="flex-1 py-3 text-gray-900 placeholder-gray-500 focus:outline-none text-base bg-transparent"
                    />
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full sm:w-auto px-8 py-3 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Suivre</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-300 pl-2">
                * Suivi disponible 24/7 pour tous nos partenaires
              </p>
            </div>
          </div>
        </section>

        {/* Mega menu (Quick Tools) */}
        <section className="px-4 md:px-8 relative z-20 -mt-16 sm:-mt-20 mb-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Calculator,
                title: "Calculer le fret",
                desc: "Estimation rapide selon poids/volume.",
              },
              {
                icon: MapPin,
                title: "Points de service",
                desc: "Trouver agences et entrepôts.",
              },
              {
                icon: Ban,
                title: "Objets interdits",
                desc: "Liste conforme aux normes.",
              },
              {
                icon: Calendar,
                title: "Planifier un envoi",
                desc: "Réserver un retrait express.",
              },
            ].map((item, index) => (
              <button
                key={index}
                className="group bg-white border border-gray-100 rounded-xl p-6 text-left shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <item.icon className="h-6 w-6 text-red-700" />
                  </div>
                  <h3 className="ml-3 text-base font-bold text-gray-900">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Service Showcase */}
        <section className="px-4 md:px-8 py-12 bg-gray-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Nos Services</h2>
              <p className="text-gray-500 mt-2">
                Une gamme complète de solutions logistiques
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6 text-red-700">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    International Shipping
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Connectez votre entreprise au monde. Notre réseau global
                    assure un transit aérien rapide, un dédouanement fluide et
                    un suivi de bout en bout pour vos importations et
                    exportations.
                  </p>
                  <span className="text-red-700 font-medium flex items-center group-hover:gap-2 transition-all">
                    En savoir plus <ArrowRight className="h-4 w-4 ml-2" />
                  </span>
                </div>
              </div>

              <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-700">
                    <Truck className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Domestic Express
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Une distribution nationale fiable et rapide. Profitez de
                    délais garantis et d'options premium pour vos livraisons
                    urgentes à travers tout le territoire.
                  </p>
                  <span className="text-blue-700 font-medium flex items-center group-hover:gap-2 transition-all">
                    En savoir plus <ArrowRight className="h-4 w-4 ml-2" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="px-4 md:px-8 mt-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Ils nous font confiance
              </h2>
              <span className="text-xs text-gray-600">Réseau mondial</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
              <img
                alt="Partner 1"
                className="h-10 object-contain"
                src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=corporate+partner+logo+clean+minimal+monochrome&image_size=square"
              />
              <img
                alt="Partner 2"
                className="h-10 object-contain"
                src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=corporate+partner+logo+clean+minimal+monochrome&image_size=square"
              />
              <img
                alt="Partner 3"
                className="h-10 object-contain"
                src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=corporate+partner+logo+clean+minimal+monochrome&image_size=square"
              />
              <img
                alt="Partner 4"
                className="h-10 object-contain"
                src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=corporate+partner+logo+clean+minimal+monochrome&image_size=square"
              />
            </div>
            <div className="mt-6 rounded-2xl overflow-hidden border border-gray-200">
              <img
                alt="Global network"
                className="w-full h-56 object-cover"
                src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=global+logistics+network+map+visualization+clean+lines+premium+corporate+style&image_size=landscape_16_9"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 md:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-900 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-red-600/20 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Prêt à expédier avec nous ?
                  </h3>
                  <p className="text-gray-400 text-lg">
                    Rejoignez des milliers d'entreprises qui font confiance à
                    ChineLivre pour leur logistique. Créez un compte
                    gratuitement dès aujourd'hui.
                  </p>
                </div>
                <div className="flex gap-4 min-w-max">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 rounded-xl bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors shadow-lg shadow-red-900/20"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 backdrop-blur border border-white/20"
                  >
                    S'inscrire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 md:px-8 py-10 border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-red-700" />
              <span className="text-sm font-semibold text-gray-900">
                ChineLivre
              </span>
            </div>
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} ChineLivre. Mentions légales ·
              Confidentialité · Contact
            </div>
          </div>
        </div>
      </footer>

      <InstallPrompt triggerOnMount />
    </div>
  );
}

export default LandingPage;
