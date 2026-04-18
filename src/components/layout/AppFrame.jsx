import {
  BadgeCheck,
  Car,
  ClipboardList,
  FileBarChart2,
  LayoutDashboard,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { cn } from '../../lib/cn.js'
import AppShell from './AppShell.jsx'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'

function navIcon(Icon, active) {
  return <Icon className={cn('size-5', active ? 'text-blue-500' : '')} />
}

export default function AppFrame({
  activeKey,
  onNavigate,
  children,
  topTitle = 'LTO Information Management System',
  topRight = 'LTO Admin Station 1A',
}) {
  return (
    <AppShell
      sidebar={
        <Sidebar
          brand={{
            icon: <BadgeCheck className="size-6 text-blue-500" />,
            title: 'LTO',
            subtitle: 'Management',
          }}
          activeKey={activeKey}
          links={[
            { key: 'dashboard', label: 'Dashboard', icon: navIcon(LayoutDashboard, activeKey === 'dashboard'), onClick: () => onNavigate?.('dashboard') },
            { key: 'drivers', label: 'Drivers', icon: navIcon(Users, activeKey === 'drivers'), onClick: () => onNavigate?.('drivers') },
            { key: 'vehicles', label: 'Vehicles', icon: navIcon(Car, activeKey === 'vehicles'), onClick: () => onNavigate?.('vehicles') },
            { key: 'registrations', label: 'Vehicle Registrations', icon: navIcon(ClipboardList, activeKey === 'registrations'), onClick: () => onNavigate?.('registrations') },
            { key: 'violations', label: 'Traffic Violations', icon: navIcon(TriangleAlert, activeKey === 'violations'), onClick: () => onNavigate?.('violations') },
            { key: 'reports', label: 'Reports', icon: navIcon(FileBarChart2, activeKey === 'reports'), onClick: () => onNavigate?.('reports') },
          ]}
          footer={{
            line1: 'Land Transportation Office',
            line2: 'Republic of the Philippines',
          }}
        />
      }
      topBar={<TopBar title={topTitle} right={topRight} />}
    >
      {children}
    </AppShell>
  )
}
