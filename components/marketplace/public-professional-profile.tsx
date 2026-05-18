import Link from "next/link";
import type { PublicProfessionalProfile } from "@/lib/marketplace/public-profile-queries";
import { Icon } from "@/components/primitives";

const PRIMARY_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-11 px-5 text-[14px] bg-ink-900 text-paper hover:bg-ink-800 border border-ink-900";

function ProfileAvatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-ink-200"
      />
    );
  }

  return (
    <div
      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center text-[22px] font-medium border border-teal-200/80"
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
}

export function PublicProfessionalProfileView({
  profile,
}: {
  profile: PublicProfessionalProfile;
}) {
  const locationLine = [profile.city, profile.state].filter(Boolean).join(", ");
  const requestHref = `/login?callbackUrl=${encodeURIComponent(
    `/marketplace/professionals/${profile.publicSlug}`,
  )}`;

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-10 pb-28 sm:pb-10">
      <Link
        href="/marketplace/categories"
        className="text-[13px] text-ink-600 hover:underline"
      >
        ← Browse categories
      </Link>

      {profile.locationRequired ? (
        <div
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900"
          role="status"
        >
          Set your facility location in the header to confirm this professional is available
          in your area and to request staffing.
        </div>
      ) : null}

      <header className="mt-6 flex flex-col sm:flex-row gap-6 sm:items-start">
        <ProfileAvatar name={profile.displayName} photoUrl={profile.photoUrl} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-ink-600">{profile.roleLabel}</p>
          <h1 className="mt-1 text-[32px] sm:text-[36px] font-medium tracking-tight">
            {profile.displayName}
          </h1>
          <p className="mt-2 text-[17px] text-ink-700">{profile.headline}</p>
          {profile.availabilityLabel ? (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-3 py-1 text-[13px] text-teal-900">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" aria-hidden />
              {profile.availabilityLabel}
            </p>
          ) : null}
          <p className="mt-2 text-[12px] text-ink-500">
            Approximate availability — confirm with an agency coordinator.
          </p>
        </div>
      </header>

      <section className="mt-8 rounded-xl border border-ink-200 bg-ink-50 px-4 py-4 text-[14px] text-ink-700 leading-relaxed">
        Staffing fulfilled by <span className="font-medium">{profile.agencyName}</span>{" "}
        coordinators. Submit a staffing request to request this professional — not a direct
        hire.
      </section>

      {profile.bio ? (
        <section className="mt-8">
          <h2 className="text-[14px] font-mono uppercase tracking-wider text-ink-500">About</h2>
          <p className="mt-3 text-[15px] text-ink-700 leading-relaxed whitespace-pre-wrap">
            {profile.bio}
          </p>
        </section>
      ) : null}

      {profile.specialties.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-[14px] font-mono uppercase tracking-wider text-ink-500">
            Specialties
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.specialties.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-ink-200 bg-white px-3 py-1 text-[13px] text-ink-800"
              >
                {tag}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.credentialsSummary.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-[14px] font-mono uppercase tracking-wider text-ink-500">
            Credentials
          </h2>
          <ul className="mt-3 space-y-2 text-[14px] text-ink-700">
            {profile.credentialsSummary.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Icon name="check" className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(profile.yearsExperienceLabel || locationLine) && (
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.yearsExperienceLabel ? (
            <div className="rounded-xl border border-ink-200 bg-white p-4">
              <p className="text-[12px] font-mono uppercase tracking-wider text-ink-500">
                Experience
              </p>
              <p className="mt-2 text-[14px] text-ink-800">{profile.yearsExperienceLabel}</p>
            </div>
          ) : null}
          {locationLine ? (
            <div className="rounded-xl border border-ink-200 bg-white p-4">
              <p className="text-[12px] font-mono uppercase tracking-wider text-ink-500">
                Service area
              </p>
              <p className="mt-2 text-[14px] text-ink-800">{locationLine}</p>
              <p className="mt-1 text-[12px] text-ink-500">City and state only — not a street address.</p>
            </div>
          ) : null}
        </section>
      )}

      <div className="mt-10 hidden sm:flex">
        {profile.canRequest ? (
          <Link href={requestHref} className={PRIMARY_LINK_CLASS}>
            Request professional
            <Icon name="arrow-right" className="w-4 h-4" />
          </Link>
        ) : (
          <p className="text-[14px] text-ink-600">
            Set your facility location above to request this professional.
          </p>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 sm:hidden border-t border-ink-200 bg-paper/95 backdrop-blur p-4 z-30">
        {profile.canRequest ? (
          <Link href={requestHref} className={`${PRIMARY_LINK_CLASS} w-full`}>
            Request professional
          </Link>
        ) : (
          <p className="text-center text-[13px] text-ink-600">
            Set facility location in the header to request staffing.
          </p>
        )}
      </div>
    </div>
  );
}
