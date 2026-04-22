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
} from 'lucide-react'
import {
  AppFrame,
  Button,
  Combobox,
  DataTable,
  PageHeader,
  SearchInput,
  SectionCard,
  VehicleDetailsHero,
} from '../../components/index.js'
import { createVehicle, deleteVehicle, getVehicle, listVehicles, updateVehicle } from '../../api/vehicles.js'
import { formatLicenseNumber } from '../../lib/licenseNumber.js'
import RegistrationForm from './RegistrationForm.jsx'
import { listRowFromApi } from './registrationMappers.js'

const vehicleTypeFilterOptions = [
  { value: '', label: 'All' },
  { value: 'Private Car', label: 'Private Car' },
  { value: 'Motorcycle', label: 'Motorcycle' },
  { value: 'Public Utility Vehicle', label: 'Public Utility Vehicle' },
]

export default function RegistrationsPage({ onNavigate, openPlateNumber }) {
  const [view, setView] = useState('list') // list | create | edit | details
  const [selectedPlateNumber, setSelectedPlateNumber] = useState(null)

  const [search, setSearch] = useState('')
  const [type, setType] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  const refreshList = useCallback(async () => {
    const rows = await listVehicles({ search, type })
    setVehicles(rows.map(listRowFromApi))
  }, [search, type])

  const openDetails = useCallback(async (plateNumber) => {
    setError('')
    setLoading(true)
    try {
      const vehicle = await getVehicle(plateNumber)
      setSelectedVehicle(vehicle)
      setSelectedPlateNumber(plateNumber)
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
        const rows = await listVehicles({ search, type })
        if (!cancelled) setVehicles(rows.map(listRowFromApi))
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
  }, [search, type])

  useEffect(() => {
    if (!openPlateNumber) return
    openDetails(openPlateNumber).finally(() => {
      onNavigate?.({ key: 'registrations' })
    })
  }, [openPlateNumber, openDetails, onNavigate])

  async function openEdit(plateNumber) {
    setError('')
    setLoading(true)
    try {
      const vehicle = await getVehicle(plateNumber)
      setSelectedVehicle(vehicle)
      setSelectedPlateNumber(plateNumber)
      setView('edit')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(plateNumber) {
    setError('')
    setSaving(true)
    try {
      await deleteVehicle(plateNumber)
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
      await createVehicle(values)
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
      await updateVehicle(selectedPlateNumber, values)
      setView('list')
      setSelectedVehicle(null)
      setSelectedPlateNumber(null)
      await refreshList()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'plateNumber',
      header: 'Plate Number',
      width: 160,
      render: (row) => <span className="font-medium">{row.plateNumber}</span>,
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
    { key: 'type', header: 'Type', width: 220, render: (row) => <span className="text-slate-600">{row.type}</span> },
    { key: 'owner', header: 'Owner', width: 220, render: (row) => <span className="text-slate-600">{row.ownerName}</span> },
    {
      key: 'actions',
      header: 'Actions',
      width: 180,
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => openDetails(row.plateNumber)}
            className="grid size-9 place-items-center rounded-xl bg-white cursor-pointer disabled:cursor-not-allowed"
            aria-label="View"
            title="View"
          >
            <Eye className="size-4 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={() => openEdit(row.plateNumber)}
            className="grid size-9 place-items-center rounded-xl bg-white cursor-pointer disabled:cursor-not-allowed "
            aria-label="Edit"
            title="Edit"
          >
            <Pencil className="size-4 text-[#bf68c5]" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.plateNumber)}
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

  if (view === 'create' || view === 'edit') {
    return (
      <AppFrame activeKey="registrations" onNavigate={onNavigate}>
        <div className="p-3">
          <PageHeader
            leading={
              <button
                type="button"
                onClick={() => setView('list')}
                className="grid size-11 place-items-center rounded-[14px] bg-[#fbf3fd] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Back"
                title="Back"
              >
                <ArrowLeft className="size-6 text-[#bf68c5]" />
              </button>
            }
            title={view === 'create' ? 'Add New Vehicle' : 'Edit Vehicle'}
            subtitle="Register a new vehicle in the system"
          />

          {error ? (
            <div className="mt-6 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6">
            <VehicleForm
              key={view === 'edit' ? (selectedVehicle?.plate_number ?? 'edit') : 'create'}
              initialValues={view === 'edit' ? selectedVehicle : null}
              onSubmit={view === 'edit' ? handleUpdate : handleCreate}
              onCancel={() => setView('list')}
              saving={saving}
              submitLabel="Save Vehicle"
            />
          </div>
        </div>
      </AppFrame>
    )
  }

  if (view === 'details' && selectedVehicle) {
    return (
      <AppFrame activeKey="registrations" onNavigate={onNavigate}>
        <div className="p-3">
          <PageHeader
            leading={
              <button
                type="button"
                onClick={() => setView('list')}
                className="grid size-12 place-items-center rounded-[14px] bg-[#fbf3fd] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Back"
                title="Back"
              >
                <ArrowLeft className="size-6 text-[#bf68c5]" />
              </button>
            }
            title="Vehicle Details"
            subtitle={`${selectedVehicle.plate_number} - ${selectedVehicle.make} ${selectedVehicle.model}`}
            action={
              <Button variant="pink" leftIcon={<Pencil className="size-5" />} onClick={() => openEdit(selectedVehicle.plate_number)}>
                Edit Vehicle
              </Button>
            }
          />

          <div className="mt-6 space-y-6">
            <VehicleDetailsHero
              plateNumber={selectedVehicle.plate_number}
              vehicleName={`${selectedVehicle.make} ${selectedVehicle.model}`.trim()}
              vehicleSub={`${selectedVehicle.year} • ${selectedVehicle.color}`}
              type={selectedVehicle.vehicle_type}
              ownerName={selectedVehicle.owner?.full_name ?? ''}
              ownerLicense={formatLicenseNumber(selectedVehicle.owner?.license_number ?? '')}
            />

            <SectionCard title="Vehicle Information" accent="pink">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Plate Number</div>
                  <div className="mt-1 font-bold">{selectedVehicle.plate_number}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Make & Model</div>
                  <div className="mt-1 font-bold">{`${selectedVehicle.make} ${selectedVehicle.model}`.trim()}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Year</div>
                  <div className="mt-1 font-bold">{selectedVehicle.year}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Color</div>
                  <div className="mt-1 font-bold">{selectedVehicle.color}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Vehicle Type</div>
                  <div className="mt-1 font-bold">{selectedVehicle.vehicle_type}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Engine Number</div>
                  <div className="mt-1 font-bold">{selectedVehicle.engine_number}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Chassis Number</div>
                  <div className="mt-1 font-bold">{selectedVehicle.chassis_number}</div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Owner Information" accent="pink">
              <button
                type="button"
                disabled={!selectedVehicle.owner?.license_number}
                onClick={() => {
                  const licenseNumber = selectedVehicle.owner?.license_number
                  if (!licenseNumber) return
                  onNavigate?.({
                    key: 'drivers',
                    driverLicenseNumber: licenseNumber,
                    returnTo: { key: 'vehicles', plateNumber: selectedVehicle.plate_number },
                  })
                }}
                className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 enabled:cursor-pointer enabled:hover:bg-slate-50 disabled:opacity-60"
                aria-label={selectedVehicle.owner?.license_number ? 'View owner details' : 'Owner not available'}
                title={selectedVehicle.owner?.license_number ? 'View owner details' : 'Owner not available'}
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-[#fbf3fd] text-[#bf68c5] ring-1 ring-[#cf89d4]/40">
                  <User className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{selectedVehicle.owner?.full_name}</div>
                  <div className="mt-0.5 text-sm text-slate-500">
                    License: {formatLicenseNumber(selectedVehicle.owner?.license_number ?? '')}
                  </div>
                </div>
                <ChevronRight className="size-5 shrink-0 text-slate-400" />
              </button>
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
          title="Vehicles"
          subtitle="List, view, edit, and manage vehicle records."
          action={
            <Button variant="pink" leftIcon={<Plus className="size-5" />} onClick={() => setView('create')}>
              Add Vehicle
            </Button>
          }
        />

        <div className="mt-6 rounded-2xl border border-[#cf89d4] bg-[#fbf3fd] p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by plate number, make, model, or owner..."
              />
            </div>

            <div className="w-full md:w-70">
              <Combobox
                leftIcon={<Filter className="size-5" />}
                value={type}
                onChange={(v) => setType(v)}
                options={vehicleTypeFilterOptions}
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
            theadClassName="bg-[#fbf3fd]"
            columns={columns}
            rows={vehicles}
            getRowKey={(row) => row.id}
          />
        </div>

        {loading ? <div className="mt-4 text-sm text-slate-500">Loading...</div> : null}
      </div>
    </AppFrame>
  )
}
