import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { navItems } from '../../data/navigation'

export function BottomTabBar() {
  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-space-xs grid grid-cols-5 items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors relative ${
                isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'
              }`
            }
          >
            {item.isPrimaryAction ? (
              <div className="w-9 h-9 rounded-xl bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-md shadow-tertiary-container/30">
                <Icon name={item.icon} className="text-[20px]" />
              </div>
            ) : (
              <>
                <Icon name={item.icon} className="text-[22px]" />
                {item.path === '/intelligence' && (
                  <span className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-tertiary-container animate-ping" />
                )}
                <span className="font-label-sm text-label-sm mt-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
