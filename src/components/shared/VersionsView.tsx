import { scriptVersions } from '../../data/mockLibrary'

export function VersionsView() {
  return (
    <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-3">
      <h4 className="font-title text-title text-on-surface">Git-Style Script Iterations</h4>
      <div className="space-y-2 font-body-sm text-body-sm">
        {scriptVersions.map((version) => (
          <div
            key={version.id}
            className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between"
          >
            <div>
              <span className="font-code text-code text-primary font-semibold">
                {version.version}
              </span>
              {version.title && <p className="text-on-surface font-medium">{version.title}</p>}
              {version.note && <p className="text-on-surface-variant">{version.note}</p>}
            </div>
            <span
              className={`font-label-sm text-label-sm px-2 py-0.5 rounded ${version.statusColorClass}`}
            >
              {version.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
