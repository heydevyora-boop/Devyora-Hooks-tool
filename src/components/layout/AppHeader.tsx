import { Icon } from '../ui/Icon'

const LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDOEBaCT22FBE_8keaaVa-o5oSbO1fGds3AMJhGCFowV4C7PcgBc6yk_okJyXrRFloTWUjLzP_XqMfEYjgnUZxtCI3WHUqNdaYC_p28jb4yu6DLYVWw_QpL8FJXl_S8816sTzsO-P4N1uWit6U-ZISRFRtN3gIPb37XzLhJd78pmRfaUcGfCRRdbS5Fy_eMoq_gEHXBLXaQfwD-1fhrCtLAlDKVee49dPGF1aSzqRFwAfmIlOAdQrzr-Q'

const AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAR0Pco1HYVCHyxkMPaNknj7xQuhsFegAFdT2BIhS3C85zy7yJa8FoPgmH_P1WtQP3u7Zl4N6X8icvqlI2c3uphMn4i7pQ81OqvvTnEzR85jo_Myr0_1WYRYdhEeFbodqw7FJbi_HSzrJyGtkbRfNohsfXBW4Z7pBbtK7U1YQIUtELgEh8uG_GXuqSgapDUy0ZF4RccUxHWNrDD5M57Ruf6FqgaZ8w_54NpFB0-Z2iCah6aVUOfTzVoZw'

interface AppHeaderProps {
  pageLabel: string
}

export function AppHeader({ pageLabel }: AppHeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] lg:sticky lg:top-0 lg:pt-0 lg:z-30">
      <div className="w-full bg-surface-container-low/90 px-gutter-mobile lg:px-8 py-0.5 flex items-center justify-between text-on-surface-variant">
        <div className="flex items-center gap-space-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-code text-[10px] tracking-wide text-on-surface-variant">
            Neural Vault v4.2 • 100% Brand Synced
          </span>
        </div>
        <span className="font-code text-[10px] text-primary font-medium tracking-tight">
          LIVE
        </span>
      </div>
      <div className="h-16 px-gutter-mobile lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-space-sm lg:hidden">
          <img alt="Devyora Hooks logo" className="h-8 w-auto object-contain" src={LOGO_URL} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-title text-title text-on-surface tracking-tight">
                Devyora Hooks
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary font-label-sm text-[10px] uppercase font-semibold">
                SCRIPT INTEL
              </span>
            </div>
          </div>
        </div>
        <span className="hidden lg:block font-headline-sm text-headline-sm text-on-surface tracking-tight">
          {pageLabel}
        </span>
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-1.5 w-64">
            <Icon name="search" className="text-[18px] text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search scripts, hooks, rules..."
              className="bg-transparent outline-none text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant w-full"
            />
          </div>
          <button
            type="button"
            title="Notifications"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <Icon name="notifications" className="text-[20px]" />
          </button>
        </div>
        <div className="flex items-center gap-space-sm lg:hidden">
          <div className="relative flex items-center justify-center">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-surface"
              src={AVATAR_URL}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-surface" />
          </div>
        </div>
      </div>
    </header>
  )
}
