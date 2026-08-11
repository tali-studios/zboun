import { SOCIAL_PLATFORMS, type SocialLinks } from "@/lib/social-links";

type Props = {
  defaults?: Partial<SocialLinks> | null;
  /** Wider grid for the main store-settings form */
  wide?: boolean;
};

export function StoreSocialLinksFields({ defaults, wide }: Props) {
  return (
    <div className={wide ? "md:col-span-3 space-y-2" : "md:col-span-2 space-y-2"}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Social media</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Optional. Leave blank to hide. Only filled links appear on your store page — use each
          platform&apos;s real link or @username.
        </p>
      </div>
      <div className={`grid gap-3 ${wide ? "md:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
        {SOCIAL_PLATFORMS.map((platform) => (
          <label key={platform.id} className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {platform.label}
              <span className="ml-1 font-normal normal-case text-slate-400">(optional)</span>
            </span>
            <input
              name={platform.field}
              type="text"
              inputMode="url"
              autoComplete="url"
              defaultValue={defaults?.[platform.field] ?? ""}
              placeholder={platform.placeholder}
              className="ui-input"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
