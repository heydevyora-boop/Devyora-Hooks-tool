import type { DirectorScene } from '../../types'

interface SceneCardProps {
  scene: DirectorScene
}

export function SceneCard({ scene }: SceneCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-md flex items-center justify-center font-code text-label-sm font-bold ${scene.colorClass}`}
          >
            {scene.id}
          </span>
          <span className="font-title text-title text-on-surface">{scene.title}</span>
        </div>
        <span className="font-code text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full font-bold">
          {scene.timeRange}
        </span>
      </div>

      {(scene.camera || scene.visual) && (
        <div className="grid grid-cols-2 gap-2">
          {scene.camera && (
            <div className="bg-surface-container-low p-2 rounded-lg flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">
                  videocam
                </span>{' '}
                Camera
              </span>
              <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                {scene.camera}
              </span>
            </div>
          )}
          {scene.visual && (
            <div className="bg-surface-container-low p-2 rounded-lg flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary-container">
                  directions_walk
                </span>{' '}
                Visual
              </span>
              <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                {scene.visual}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="bg-surface-container-high/40 p-3 rounded-lg flex flex-col gap-1">
        <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
          Spoken Dialogue
        </span>
        <p className="font-title text-title text-on-surface font-medium leading-relaxed">
          {scene.dialogue}
        </p>
      </div>

      {(scene.broll || scene.overlay || scene.transition) && (
        <div className="flex flex-col gap-1.5 text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low p-2.5 rounded-lg">
          {scene.broll && (
            <div className="flex items-center gap-2">
              <span className="font-code text-label-sm text-secondary font-bold">B-ROLL:</span>
              <span>{scene.broll}</span>
            </div>
          )}
          {scene.overlay && (
            <div className="flex items-center gap-2">
              <span className="font-code text-label-sm text-tertiary-container font-bold">
                OVERLAY:
              </span>
              <span className="px-2 py-0.5 rounded bg-yellow-300 text-black font-code text-label-sm font-black">
                {scene.overlay}
              </span>
            </div>
          )}
          {scene.transition && (
            <div className="flex items-center gap-2">
              <span className="font-code text-label-sm text-primary font-bold">TRANSITION:</span>
              <span>{scene.transition}</span>
            </div>
          )}
        </div>
      )}

      {scene.directorNote && (
        <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low p-2 rounded-lg">
          <span className="font-code text-label-sm text-primary font-bold">DIRECTOR NOTE:</span>
          <span>{scene.directorNote}</span>
        </div>
      )}

      {scene.loopNote && (
        <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low p-2 rounded-lg">
          <span className="font-code text-label-sm text-tertiary-container font-bold">
            LOOP ARCHITECTURE:
          </span>
          <span>{scene.loopNote}</span>
        </div>
      )}
    </div>
  )
}
