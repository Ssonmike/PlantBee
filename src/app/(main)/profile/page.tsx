import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import LocationSetup from "@/components/profile/LocationSetup";

export const metadata = { title: "Mi Perfil" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, locationProfile, stats] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    }),
    db.locationProfile.findUnique({
      where: { userId: session.user.id },
    }),
    db.userPlant.count({
      where: { userId: session.user.id, isArchived: false },
    }),
  ]);

  if (!user) redirect("/login");

  const memberSince = new Date(user.createdAt).getFullYear();

  return (
    <div>
      <Header title="Mi Perfil" />

      <div className="px-4 py-4 space-y-5 max-w-lg mx-auto">
        {/* Profile card */}
        <div className="card p-5 text-center">
          <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand-200">
            <span className="text-3xl font-bold text-white">
              {user.name?.[0]?.toUpperCase() ?? "🌿"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-600">{stats}</p>
              <p className="text-xs text-gray-500">Plantas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-600">{memberSince}</p>
              <p className="text-xs text-gray-500">Desde</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>📍</span> Ubicación
          </h3>
          {locationProfile?.city ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  {locationProfile.city}, {locationProfile.country}
                </p>
                <p className="text-xs text-gray-500">
                  {locationProfile.climateZone ? `Clima: ${locationProfile.climateZone}` : "Ubicación configurada"}
                </p>
              </div>
              <LocationSetup
                currentLocation={locationProfile
                  ? {
                      city: locationProfile.city,
                      country: locationProfile.country,
                      lat: locationProfile.latitude,
                      lng: locationProfile.longitude,
                    }
                  : null}
              />
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Configura tu ubicación para recibir recomendaciones personalizadas según tu clima.
              </p>
              <LocationSetup currentLocation={null} />
            </div>
          )}
        </div>

        {/* App info */}
        <div className="card p-4">
          <h3 className="font-bold text-gray-900 mb-3">Acerca de PlantBee</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="text-xl">🤖</span>
              <p>Diagnósticos powered by Claude AI (Anthropic)</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="text-xl">🌤️</span>
              <p>Datos climáticos: Open-Meteo (gratuito, sin tracking)</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="text-xl">🔒</span>
              <p>Tus fotos se procesan y no se almacenan permanentemente</p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full py-3 text-red-500 font-semibold rounded-2xl border border-red-200 hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 pb-4">
          PlantBee v0.1.0 · MVP
        </p>
      </div>
    </div>
  );
}
