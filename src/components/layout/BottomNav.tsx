import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getNavItems } from './nav'

export function BottomNav() {
  const { role } = useAuthStore()
  const items = getNavItems(role as any)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white mobile-blur safe-bottom lg:hidden">
      <ul className="flex justify-around items-center py-2">
        {items.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `flex flex-col items-center text-[11px] ${isActive ? 'text-blue-600' : 'text-gray-600'}`
              }
            >
              <item.icon className="h-7 w-7 mb-1" />
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
