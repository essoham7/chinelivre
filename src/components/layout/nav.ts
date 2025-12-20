import { LayoutDashboard, Bell, User } from 'lucide-react'

export type Role = 'admin' | 'client'

export const getNavItems = (role: Role) => ([
  {
    name: 'Tableau de bord',
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
])
