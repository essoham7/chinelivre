import { LayoutDashboard, Bell, User, Users } from 'lucide-react'

export type Role = 'admin' | 'client'

export const getNavItems = (role: Role) => ([
  {
    name: 'Tableau de bord',
    href: role === 'admin' ? '/admin/dashboard' : '/client/dashboard',
    icon: LayoutDashboard,
  },
  ...(role === 'admin' ? [{
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
  }] : []),
  {
    name: 'Notifications',
    href: role === 'admin' ? '/admin/notifications' : '/client/notifications',
    icon: Bell,
  },
  {
    name: 'Profil',
    href: role === 'admin' ? '/admin/profile' : '/profile',
    icon: User,
  },
])
