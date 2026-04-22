import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  Eye,
  Filter,
  User,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  CarFront,
  FileText
} from 'lucide-react'
import {
  AppFrame,
  Button,
  Combobox,
  DataTable,
  PageHeader,
  SearchInput,
  SectionCard,
  RegistrationDetailsHero,
  StatusPill
} from '../../components/index.js'
import { createRegistration, deleteRegistration, getRegistration, listRegistrations, updateRegistration  } from '../../api/registrations.js'
import { formatLicenseNumber } from '../../lib/licenseNumber.js'
import RegistrationForm from './RegistrationForm.jsx'
import { listRowFromApi } from './registrationMappers.js'

const registrationStatusFilters = [
  { value: '', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Suspended', label: 'Suspended' },
]

export default function RegistrationsPage({ onNavigate, openRegistrationNumber }) {
  const [view, setView] = useState('list') // list | create | edit | details
  const [selectedRegistrationNumber, setSelectedRegistrationNumber] = useState(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [registrations, setRegistrations] = useState([])
  const [selectedRegistration, setSelectedRegistration] = useState(null)

  const refreshList = useCallback(async () => {
    const rows = await listRegistrations({ search, status })
    setRegistrations(rows.map(listRowFromApi))
  }, [search, status])

  const openDetails = useCallback(async (regNumber) => {
    setError('')
    setLoading(true)
    try {
      const registration = await getRegistration(regNumber)
      setSelectedRegistration(registration)
      setSelectedRegistrationNumber(regNumber)
      setView('details')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError('')
      setLoading(true)
      try {
        const rows = await listRegistrations({ search, status })
        if (!cancelled) setRegistrations(rows.map(listRowFromApi))
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [search, status])

  useEffect(() => {
    if (!openRegistrationNumber) return
    openDetails(openRegistrationNumber).finally(() => {
      onNavigate?.({ key: 'registrations' })
    })
  }, [openRegistrationNumber, openDetails, onNavigate])

  async function openEdit(regNumber) {
    setError('')
    setLoading(true)
    try {
      const registration = await getRegistration(regNumber)
      setSelectedRegistration(registration)
      setSelectedRegistrationNumber(regNumber)
      setView('edit')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(regNumber) {
    setError('')
    setSaving(true)
    try {
      await deleteRegistration(regNumber)
      await refreshList()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate(values) {
    setError('')
    setSaving(true)
    try {
      await createRegistration(values)
      setView('list')
      await refreshList()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(values) {
    setError('')
    setSaving(true)
    try {
      await updateRegistration(selectedRegistrationNumber, values)
      setView('list')
      setSelectedRegistration(null)
      setSelectedRegistrationNumber(null)
      await refreshList()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'registrationNumber',
      header: 'Registration Number',
      width: 220,
      render: (row) => <span className="font-medium">{row.registrationNumber}</span>,
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (row) => (
        <div>
          <div className="font-medium">{row.vehicleName}</div>
          <div className="mt-0.5 text-sm text-slate-500">{row.vehicleSub}</div>
        </div>
      ),
    },
    { key: 'owner', header: 'Owner', width: 220, render: (row) => <span className="text-slate-600">{row.ownerName}</span> },
    {
      key: 'status',
      header: 'Status',
      width: 160,
      render: (row) => (
        <StatusPill tone={row.statusTone}>{row.statusLabel}</StatusPill>
      ),
    },
    {
      key: 'expiration',
      header: 'Expiration',
      width: 160,
      render: (row) => <span className="text-slate-600">{row.expirationDate}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 180,
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => openDetails(row.regNumber)}
            className="grid size-9 place-items-center rounded-xl bg-white cursor-pointer disabled:cursor-not-allowed"
            aria-label="View"
            title="View"
          >
            <Eye className="size-4 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={() => openEdit(row.regNumber)}
            className="grid size-9 place-items-center rounded-xl bg-white cursor-pointer disabled:cursor-not-allowed "
            aria-label="Edit"
            title="Edit"
          >
            <Pencil className="size-4 text-[#bf68c5]" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.regNumber)}
            disabled={saving}
            className="grid size-9 place-items-center rounded-xl bg-white cursor-pointer disabled:cursor-not-allowed"
            aria-label="Delete"
            title="Delete"
          >
            <Trash2 className="size-4 text-red-500" />
          </button>
        </div>
      ),
    },
  ]

  // create / edit registration
  if (view === 'create' || view === 'edit') {
    return (
      <AppFrame activeKey="registrations" onNavigate={onNavigate}>
        <div className="p-3">
          <PageHeader
            leading={
              <button
                type="button"
                onClick={() => setView('list')}
                // TODO: update colors
                className="grid size-11 place-items-center rounded-[14px] bg-[#fbf3fd] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Back"
                title="Back"
              >
                <ArrowLeft className="size-6 text-[#bf68c5]" />
              </button>
            }
            title={view === 'create' ? 'Register Vehicle' : 'Edit Vehicle Registration'}
            subtitle="Register an existing vehicle in the system"
          />

          {error ? (
            // TODO: update colors
            <div className="mt-6 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6">
            <RegistrationForm
              key={view === 'edit' ? (selectedRegistration?.registration_number ?? 'edit') : 'create'}
              initialValues={view === 'edit' ? selectedRegistration : null}
              onSubmit={view === 'edit' ? handleUpdate : handleCreate}
              onCancel={() => setView('list')}
              saving={saving}
              submitLabel="Register Vehicle"
            />
          </div>
        </div>
      </AppFrame>
    )
  }

  // view specific registration
  if (view === 'details' && selectedRegistration) {
    const statusNode = (
      <StatusPill
        tone={toStatusTone(selectedRegistration.registration_status)}
        className="bg-[#d1fae5] text-[#0f7a33] ring-0"
      >
        {selectedRegistration.registration_status}
      </StatusPill>
    )

    return (
      <AppFrame activeKey="registrations" onNavigate={onNavigate}>
        <div className="p-3">
          <PageHeader
            leading={
              <button
                type="button"
                onClick={() => setView('list')}
                
                /*TODO: update colors*/
                className="grid size-12 place-items-center rounded-[14px] bg-[#fbf3fd] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Back"
                title="Back"
              >
                <ArrowLeft className="size-6 text-[#bf68c5]" />
              </button>
            }
            title="Registration Details"
            subtitle={`${selectedRegistration.registration_number} - ${selectedRegistration.vehicle?.make} ${selectedRegistration.vehicle?.model}`}
            action={
              // TODO: update colors
              <Button variant="pink" leftIcon={<Pencil className="size-5" />} onClick={() => openEdit(selectedRegistration.registration_number)}>
                Edit Vehicle Registration
              </Button>
            }
          />

          <div className="mt-6 space-y-6">
            <RegistrationDetailsHero
              registrationNumber={selectedRegistration.registration_number}
              registrationDate={selectedRegistration.registration_date}
              expirationDate={selectedRegistration.expiration_ate}
              registrationStatus={statusNode}
              vehiclePlate={selectedRegistration.vehicle?.plate_number}
              vehicleSub={`${selectedRegistration.vehicle?.make} ${selectedRegistration.vehicle?.model} (${selectedRegistration.vehicle?.year})`}
              ownerName={selectedRegistration.owner?.full_name ?? ''}
              ownerLicense={formatLicenseNumber(selectedRegistration.owner?.license_number ?? '')}
            />

            <SectionCard title="Vehicle Information" accent="pink">
              <button
                type="button"
                disabled={!selectedRegistration.vehicle?.plate_number}
                onClick={() => {
                  const plateNumber = selectedRegistration.vehicle?.plate_number
                  if (!plateNumber) return
                  onNavigate?.({
                    key: 'vehicles',
                    vehiclePlateNumber: plateNumber,
                    returnTo: { key: 'registrations', regNumber: selectedRegistration.registration_number },
                  })
                }}
                className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 enabled:cursor-pointer enabled:hover:bg-slate-50 disabled:opacity-60"
                aria-label={selectedRegistration.vehicle?.plate_number ? 'View vehicle details' : 'Vehicle not available'}
                title={selectedRegistration.vehicle?.plate_number ? 'View vehicle details' : 'Vehicle not available'}
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-[#fbf3fd] text-[#bf68c5] ring-1 ring-[#cf89d4]/40">
                  <CarFront className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{selectedRegistration.vehicle?.plate_number}</div>
                  <div className="mt-0.5 text-sm text-slate-500">
                    {`${selectedRegistration.vehicle?.make} ${selectedRegistration.vehicle?.model} (${selectedRegistration.vehicle?.year})`}
                  </div>
                </div>
                <ChevronRight className="size-5 shrink-0 text-slate-400" />
              </button>
            </SectionCard>

            <SectionCard title="Owner Information" accent="pink">
              <button
                type="button"
                disabled={!selectedRegistration.owner?.license_number}
                onClick={() => {
                  const licenseNumber = selectedRegistration.owner?.license_number
                  if (!licenseNumber) return
                  onNavigate?.({
                    key: 'drivers',
                    driverLicenseNumber: licenseNumber,
                    returnTo: { key: 'registrations', regNumber: selectedRegistration.registration_number },
                  })
                }}
                className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 enabled:cursor-pointer enabled:hover:bg-slate-50 disabled:opacity-60"
                aria-label={selectedRegistration.owner?.license_number ? 'View owner details' : 'Owner not available'}
                title={selectedRegistration.owner?.license_number ? 'View owner details' : 'Owner not available'}
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-[#fbf3fd] text-[#bf68c5] ring-1 ring-[#cf89d4]/40">
                  <User className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{selectedRegistration.owner?.full_name}</div>
                  <div className="mt-0.5 text-sm text-slate-500">
                    License: {formatLicenseNumber(selectedRegistration.owner?.license_number ?? '')}
                  </div>
                </div>
                <ChevronRight className="size-5 shrink-0 text-slate-400" />
              </button>
            </SectionCard>

            {/* List of registrations */}
            <SectionCard title={`Registration History (${0})`}>

            </SectionCard>

          </div>
        </div>
      </AppFrame>
    )
  }

  return (
    <AppFrame activeKey="registrations" onNavigate={onNavigate}>
      <div className="p-3">
        <PageHeader
          title="Vehicle Registrations"
          subtitle="List, view, edit, and manage vehicle registrations."
          action={
            <Button variant="pink" leftIcon={<Plus className="size-5" />} onClick={() => setView('create')}>
              Register Vehicle
            </Button>
          }
        />
        {/*TODO: update colors*/}
        <div className="mt-6 rounded-2xl border border-[#cf89d4] bg-[#fbf3fd] p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by registration number, license plate, owner, or vehicle..."
              />
            </div>

            <div className="w-full md:w-70">
              <Combobox
                leftIcon={<Filter className="size-5" />}
                value={status}
                onChange={(v) => setStatus(v)}
                options={registrationStatusFilters}
                placeholder="Filter"
                searchable={false}
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          <DataTable
            // TODO: update colors
            theadClassName="bg-[#fbf3fd]"
            columns={columns}
            rows={registrations}
            getRowKey={(row) => row.id}
          />
        </div>

        {loading ? <div className="mt-4 text-sm text-slate-500">Loading...</div> : null}
      </div>
    </AppFrame>
  )
}
