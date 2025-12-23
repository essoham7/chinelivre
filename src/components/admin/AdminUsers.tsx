import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import {
  AlertCircle,
  Check,
  Pencil,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
} from "lucide-react";

type ProfileRow = {
  id: string;
  email: string | null;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  company: string | null;
  created_at: string;
};

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<ProfileRow>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createDraft, setCreateDraft] = useState<Partial<ProfileRow>>({
    role: "client",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(
    () => () => {}
  );
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "client" | "admin">(
    "all"
  );
  const [cityFilter, setCityFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  // debounce local sans état

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from("profiles")
      .select(
        "id,email,role,first_name,last_name,phone,country,city,company,created_at"
      );

    // Filtres
    if (roleFilter !== "all") {
      query = query.eq("role", roleFilter);
    }
    if (countryFilter.trim()) {
      query = query.ilike("country", `%${countryFilter.trim()}%`);
    }
    if (cityFilter.trim()) {
      query = query.ilike("city", `%${cityFilter.trim()}%`);
    }
    if (search.trim()) {
      const s = search.trim();
      query = query.or(
        `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,city.ilike.%${s}%,company.ilike.%${s}%`
      );
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) setError(error.message);
    setProfiles(data || []);
    setLoading(false);
  }, [search, roleFilter, cityFilter, countryFilter]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      fetchProfiles();
    }, 250);
    return () => clearTimeout(t);
  }, [search, roleFilter, cityFilter, countryFilter, fetchProfiles]);

  const startEdit = (p: ProfileRow) => {
    setEditingId(p.id);
    setDraft(p);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: draft.first_name ?? null,
        last_name: draft.last_name ?? null,
        phone: draft.phone ?? null,
        country: draft.country ?? null,
        city: draft.city ?? null,
        company: draft.company ?? null,
      })
      .eq("id", editingId);
    if (error) setError(error.message);
    setEditingId(null);
    await fetchProfiles();
    setLoading(false);
  };

  const promote = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", id);
    if (error) setError(error.message);
    await fetchProfiles();
    setLoading(false);
  };

  const demote = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: "client" })
      .eq("id", id);
    if (error) setError(error.message);
    await fetchProfiles();
    setLoading(false);
  };

  const remove = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) setError(error.message);
    await fetchProfiles();
    setLoading(false);
  };

  const createProfile = async () => {
    // Crée un profil pour un utilisateur existant (nécessite l'ID auth utilisateur)
    if (!createDraft.id) {
      setError("L'ID utilisateur est requis pour créer un profil");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({
      id: createDraft.id as string,
      email: (createDraft.email as string) ?? null,
      role: (createDraft.role as string) ?? "client",
      first_name: (createDraft.first_name as string) ?? null,
      last_name: (createDraft.last_name as string) ?? null,
      phone: (createDraft.phone as string) ?? null,
      country: (createDraft.country as string) ?? null,
      city: (createDraft.city as string) ?? null,
      company: (createDraft.company as string) ?? null,
    });
    if (error) setError(error.message);
    setShowCreate(false);
    setCreateDraft({ role: "client" });
    await fetchProfiles();
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Ajouter un profil
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-md shadow-sm p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Recherche
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, email, téléphone, ville, entreprise..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Rôle
          </label>
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as "all" | "client" | "admin")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tous</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Pays
          </label>
          <input
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            placeholder="Ex: Cameroun"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Ville
          </label>
          <input
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="Ex: Douala"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="md:col-span-5 flex justify-end">
          <button
            onClick={() => {
              setSearch("");
              setRoleFilter("all");
              setCityFilter("");
              setCountryFilter("");
            }}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" /> {error}
        </div>
      )}

      {/* Vue mobile en cartes */}
      <div className="sm:hidden space-y-3">
        {profiles.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                {editingId === p.id ? (
                  <div className="flex space-x-2">
                    <input
                      className="border rounded px-2 py-1 w-32"
                      value={draft.first_name ?? ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, first_name: e.target.value }))
                      }
                    />
                    <input
                      className="border rounded px-2 py-1 w-32"
                      value={draft.last_name ?? ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, last_name: e.target.value }))
                      }
                    />
                  </div>
                ) : (
                  <div className="text-sm font-medium text-gray-900">
                    {(p.first_name || "").toString()}{" "}
                    {(p.last_name || "").toString()}
                  </div>
                )}
                <div className="text-xs text-gray-500">{p.email}</div>
                <div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      p.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.role || "client"}
                  </span>
                </div>
                <div className="text-xs text-gray-700">
                  Ville:{" "}
                  {editingId === p.id ? (
                    <input
                      className="border rounded px-2 py-1 w-32 ml-2"
                      value={draft.city ?? ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, city: e.target.value }))
                      }
                    />
                  ) : (
                    <span className="ml-1">{p.city}</span>
                  )}
                </div>
                <div className="text-xs text-gray-700">
                  Téléphone:{" "}
                  {editingId === p.id ? (
                    <input
                      className="border rounded px-2 py-1 w-32 ml-2"
                      value={draft.phone ?? ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, phone: e.target.value }))
                      }
                    />
                  ) : (
                    <span className="ml-1">{p.phone}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {editingId === p.id ? (
                  <>
                    <button
                      onClick={() => {
                        setConfirmTitle("Confirmer");
                        setConfirmMessage("Enregistrer les modifications ?");
                        setConfirmAction(() => saveEdit);
                        setConfirmOpen(true);
                      }}
                      className="inline-flex items-center px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(p)}
                      className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {p.role !== "admin" ? (
                      <button
                        onClick={() => {
                          setConfirmTitle("Promouvoir");
                          setConfirmMessage(
                            "Promouvoir cet utilisateur en administrateur ?"
                          );
                          setConfirmAction(() => () => promote(p.id));
                          setConfirmOpen(true);
                        }}
                        className="inline-flex items-center px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        <ArrowUpCircle className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setConfirmTitle("Rétrograder");
                          setConfirmMessage(
                            "Rétrograder cet administrateur en client ?"
                          );
                          setConfirmAction(() => () => demote(p.id));
                          setConfirmOpen(true);
                        }}
                        className="inline-flex items-center px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        <ArrowDownCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setConfirmTitle("Supprimer");
                        setConfirmMessage(
                          "Supprimer ce profil ? Cette action est irréversible."
                        );
                        setConfirmAction(() => () => remove(p.id));
                        setConfirmOpen(true);
                      }}
                      className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vue desktop en tableau */}
      <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                Nom
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                Rôle
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                Ville
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                Téléphone
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  {editingId === p.id ? (
                    <div className="flex space-x-2">
                      <input
                        className="border rounded px-2 py-1 w-32"
                        value={draft.first_name ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            first_name: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="border rounded px-2 py-1 w-32"
                        value={draft.last_name ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, last_name: e.target.value }))
                        }
                      />
                    </div>
                  ) : (
                    <span>
                      {(p.first_name || "").toString()}{" "}
                      {(p.last_name || "").toString()}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">{p.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      p.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.role || "client"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {editingId === p.id ? (
                    <input
                      className="border rounded px-2 py-1 w-32"
                      value={draft.city ?? ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, city: e.target.value }))
                      }
                    />
                  ) : (
                    <span>{p.city}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === p.id ? (
                    <input
                      className="border rounded px-2 py-1 w-32"
                      value={draft.phone ?? ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, phone: e.target.value }))
                      }
                    />
                  ) : (
                    <span>{p.phone}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  {editingId === p.id ? (
                    <>
                      <button
                        onClick={() => {
                          setConfirmTitle("Confirmer");
                          setConfirmMessage("Enregistrer les modifications ?");
                          setConfirmAction(() => saveEdit);
                          setConfirmOpen(true);
                        }}
                        className="inline-flex items-center px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(p)}
                        className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {p.role !== "admin" ? (
                        <button
                          onClick={() => {
                            setConfirmTitle("Promouvoir");
                            setConfirmMessage(
                              "Promouvoir cet utilisateur en administrateur ?"
                            );
                            setConfirmAction(() => () => promote(p.id));
                            setConfirmOpen(true);
                          }}
                          className="inline-flex items-center px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setConfirmTitle("Rétrograder");
                            setConfirmMessage(
                              "Rétrograder cet administrateur en client ?"
                            );
                            setConfirmAction(() => () => demote(p.id));
                            setConfirmOpen(true);
                          }}
                          className="inline-flex items-center px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          <ArrowDownCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setConfirmTitle("Supprimer");
                          setConfirmMessage(
                            "Supprimer ce profil ? Cette action est irréversible."
                          );
                          setConfirmAction(() => () => remove(p.id));
                          setConfirmOpen(true);
                        }}
                        className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg space-y-3">
            <h2 className="text-lg font-semibold">Créer un profil</h2>
            <p className="text-sm text-gray-600">
              Pour créer un profil, renseignez l'ID utilisateur Supabase déjà
              existant.
            </p>
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="User ID (auth.users.id)"
              value={(createDraft.id as string) || ""}
              onChange={(e) =>
                setCreateDraft((d) => ({ ...d, id: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Email"
                value={(createDraft.email as string) || ""}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, email: e.target.value }))
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Téléphone"
                value={(createDraft.phone as string) || ""}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, phone: e.target.value }))
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Prénom"
                value={(createDraft.first_name as string) || ""}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, first_name: e.target.value }))
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Nom"
                value={(createDraft.last_name as string) || ""}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, last_name: e.target.value }))
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Pays"
                value={(createDraft.country as string) || ""}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, country: e.target.value }))
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Ville"
                value={(createDraft.city as string) || ""}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, city: e.target.value }))
                }
              />
              <select
                className="border rounded px-3 py-2"
                value={(createDraft.role as string) || "client"}
                onChange={(e) =>
                  setCreateDraft((d) => ({ ...d, role: e.target.value }))
                }
              >
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-3 py-2 rounded bg-gray-200 text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setConfirmTitle("Créer le profil");
                  setConfirmMessage(
                    "Créer ce profil avec les informations saisies ?"
                  );
                  setConfirmAction(() => createProfile);
                  setConfirmOpen(true);
                }}
                className="px-3 py-2 rounded bg-blue-600 text-white"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 shadow rounded px-3 py-2 text-sm">
          Chargement...
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmTitle}
            </h3>
            <p className="text-sm text-gray-700 mb-4">{confirmMessage}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-3 py-2 rounded bg-gray-200 text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  confirmAction();
                }}
                className="px-3 py-2 rounded bg-blue-600 text-white"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
