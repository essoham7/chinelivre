import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Bell, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export function BottomNav() {
  const { role } = useAuthStore()
  const items = [
    {
      name: 'Accueil',
      href: role === 'admin' ? '/admin/dashboard' : '/client/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Notifications',
      href: role === 'admin' ? '/admin/notifications' : '/client/notifications',
      icon: Bell,
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: User,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white lg:hidden">
      <ul className="flex justify-around items-center py-2">
        {items.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${isActive ? 'text-blue-600' : 'text-gray-600'}`
              }
            >
              <item.icon className="h-6 w-6 mb-1" />
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
