import { useCallback, useEffect, useState } from 'react'
import {
  ArrowDownUp,
  ArrowLeft,
  CarFront,
  ChevronRight,
  ClipboardList,
  Eye,
  Filter,
  IdCard,
  MessageCircleWarning,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import {
  AppFrame,
  Button,
  Combobox,
  DataTable,
  DriverDetailsHero,
  IconButton,
  KeyValueGrid,
  PageHeader,
  SearchInput,
  SectionCard,
  StatusPill,
} from '../../components/index.js'
import { createDriver, deleteDriver, getDriver, listDrivers, updateDriver } from '../../api/drivers.js'
import DriverForm from './DriverForm.jsx'
import { listRowFromApi, toStatusTone } from './driverMappers.js'
import { formatLicenseNumber } from '../../lib/licenseNumber.js'

const statusFilterOptions = [
  { value: '', label: 'All' },
  { value: 'Valid', label: 'Valid' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Revoked', label: 'Revoked' },
]

const licenseTypeFilterOptions = [
  { value: '', label: 'All' },
  { value: 'Student Permit', label: 'Student Permit' },
  { value: 'Non-Professional', label: 'Non-Professional' },
  { value: 'Professional', label: 'Professional' },
]

const sortOptions = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
]

const formatMoney = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 'PHP 0.00'
  return `PHP ${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const violationTone = (status) => {
  if (status === 'Paid') return 'success'
  if (status === 'Contested') return 'warning'
  if (status === 'Unpaid') return 'danger'
  return 'neutral'
}

export default function DriversPage({ onNavigate, openLicenseNumber, returnTo }) {
  const [view, setView] = useState('list') // list | create | edit | details
  const [selectedLicenseNumber, setSelectedLicenseNumber] = useState(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [sort, setSort] = useState('name_asc')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [drivers, setDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState(null)

  const openDetails = useCallback(async (licenseNumber) => {
    setError('')
    setLoading(true)
    try {
      const driver = await getDriver(licenseNumber)
      setSelectedDriver(driver)
      setSelectedLicenseNumber(licenseNumber)
      setView('details')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const applySort = useCallback((rows) => {
    const sorted = [...rows].sort((a, b) =>
      String(a.name ?? '').localeCompare(String(b.name ?? ''), 'en'),
    )
    return sort === 'name_desc' ? sorted.reverse() : sorted
  }, [sort])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError('')
      setLoading(true)
      try {
        const rows = await listDrivers({ search, status, type: licenseType })
        const mapped = rows.map(listRowFromApi)
        if (!cancelled) setDrivers(applySort(mapped))
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
  }, [search, status, licenseType, sort, applySort])

  useEffect(() => {
    if (!openLicenseNumber) return
    openDetails(openLicenseNumber).finally(() => {
      onNavigate?.({ key: 'drivers', returnTo: returnTo ?? null })
    })
  }, [openLicenseNumber, openDetails, onNavigate, returnTo])

  async function openEdit(licenseNumber) {
    setError('')
    setLoading(true)
    try {
      const driver = await getDriver(licenseNumber)
      setSelectedDriver(driver)
      setSelectedLicenseNumber(licenseNumber)
      setView('edit')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(licenseNumber) {
    setError('')
    setSaving(true)
    try {
      await deleteDriver(licenseNumber)
      const rows = await listDrivers({ search, status, type: licenseType })
      setDrivers(applySort(rows.map(listRowFromApi)))
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
      await createDriver(values)
      setView('list')
      const rows = await listDrivers({ search, status, type: licenseType })
      setDrivers(applySort(rows.map(listRowFromApi)))
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
      await updateDriver(selectedLicenseNumber, values)
      setView('list')
      setSelectedDriver(null)
      setSelectedLicenseNumber(null)
      const rows = await listDrivers({ search, status, type: licenseType })
      setDrivers(applySort(rows.map(listRowFromApi)))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'licenseNumber',
      header: 'License Number',
      width: 200,
      render: (row) => (
        <span className="font-medium">{formatLicenseNumber(row.licenseNumber)}</span>
      ),
    },
    { key: 'name', header: 'Name', render: (row) => row.name },
    {
      key: 'licenseType',
      header: 'License Type',
      width: 200,
      render: (row) => <span className="text-slate-600">{row.licenseType}</span>,
    },
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
      render: (row) => <span className="text-slate-600">{row.expiration}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 220,
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <IconButton label="View" onClick={() => openDetails(row.licenseNumber)}>
            <Eye className="size-4" />
          </IconButton>
          <IconButton label="Edit" onClick={() => openEdit(row.licenseNumber)}>
            <Pencil className="size-4 text-[#8981d2]" />
          </IconButton>
          <IconButton label="Delete" onClick={() => handleDelete(row.licenseNumber)} disabled={saving}>
            <Trash2 className="size-4 text-red-500" />
          </IconButton>
        </div>
      ),
    },
  ]

  if (view === 'create' || view === 'edit') {
    const isEdit = view === 'edit'
    const initialValues = isEdit
      ? {
        license_number: selectedDriver?.license_number ?? '',
        first_name: selectedDriver?.first_name ?? '',
        middle_name: selectedDriver?.middle_name ?? '',
        last_name: selectedDriver?.last_name ?? '',
        date_of_birth: selectedDriver?.date_of_birth ?? '',
        sex: selectedDriver?.sex ?? 'M',
        street: selectedDriver?.address?.street ?? '',
        city: selectedDriver?.address?.city ?? '',
        region: selectedDriver?.address?.region ?? '',
        province: selectedDriver?.address?.province ?? '',
        postal_code: selectedDriver?.address?.postal_code ?? '',
        license_type: selectedDriver?.license_type ?? 'Professional',
        license_status: selectedDriver?.license_status ?? 'Valid',
        issuance_date: selectedDriver?.issuance_date ?? '',
        expiration_date: selectedDriver?.expiration_date ?? '',
      }
      : null

    return (
      <AppFrame activeKey="drivers" onNavigate={onNavigate}>
        <div className="p-3">
          <PageHeader
            leading={
              <button
                type="button"
                onClick={() => {
                  setView('list')
                  setError('')
                }}
                className="grid size-12 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Back"
                title="Back"
              >
                <ArrowLeft className="size-6 text-[#8981d2]" />
              </button>
            }
            title={isEdit ? 'Edit Driver' : 'Add New Driver'}
            subtitle={isEdit ? 'Update driver record details.' : 'Create a new driver record.'}
          />
          <div className="mt-6">
            <DriverForm
              mode={isEdit ? 'edit' : 'create'}
              initialValues={initialValues}
              busy={saving}
              error={error}
              submitLabel={isEdit ? 'Save Changes' : 'Save Driver'}
              onCancel={() => {
                setView('list')
                setError('')
              }}
              onSubmit={isEdit ? handleUpdate : handleCreate}
            />
          </div>
        </div>
      </AppFrame>
    )
  }

  if (view === 'details' && selectedDriver) {
    const age = (() => {
      const dob = new Date(selectedDriver.date_of_birth)
      if (Number.isNaN(dob.getTime())) return ''
      const today = new Date()
      let years = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years -= 1
      return String(Math.max(0, years))
    })()

    const statusNode = (
      <StatusPill
        tone={toStatusTone(selectedDriver.license_status)}
        className="bg-[#d1fae5] text-[#0f7a33] ring-0"
      >
        {selectedDriver.license_status}
      </StatusPill>
    )

    // view details of a driver
    return (
      <AppFrame activeKey="drivers" onNavigate={onNavigate}>
        <div className="space-y-6">
          <div className="p-3">
            <PageHeader
              leading={
                <button
                  type="button"
                  onClick={() => {
                    if (returnTo) return onNavigate?.(returnTo)
                    setView('list')
                  }}
                  className="grid size-12 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                  aria-label="Back"
                  title="Back"
                >
                  <ArrowLeft className="size-6 text-[#8981d2]" />
                </button>
              }
              title="Driver Details"
              subtitle={selectedDriver.full_name}
              action={
                <Button leftIcon={<Pencil className="size-5" />} onClick={() => openEdit(selectedDriver.license_number)}>
                  Edit Driver
                </Button>
              }
            />
          </div>

          <div className="mx-3 -mt-3 space-y-6">
            <DriverDetailsHero
              licenseNumber={formatLicenseNumber(selectedDriver.license_number)}
              name={selectedDriver.full_name}
              type={selectedDriver.license_type}
              status={statusNode}
              issued={selectedDriver.issuance_date}
              expires={selectedDriver.expiration_date}
            />

            <SectionCard title="Personal Information" icon={<Users className="size-4" />}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Full Name</div>
                  <div className="mt-1 font-bold">{selectedDriver.full_name}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Date of Birth</div>
                  <div className="mt-1 font-bold">{selectedDriver.date_of_birth}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Age</div>
                  <div className="mt-1 font-bold">{age ? `${age} years old` : ''}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Sex</div>
                  <div className="mt-1 font-bold">{selectedDriver.sex === 'M' ? 'Male' : 'Female'}</div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Address Information" icon={<ClipboardList className="size-4" />}>
              <p>{selectedDriver.address?.street}, {selectedDriver.address?.city}</p>
              <p>{selectedDriver.address?.province}, {selectedDriver.address?.region} {selectedDriver.address?.postal_code}</p>
            </SectionCard>

            <SectionCard
              title="Vehicles Owned"
              icon={<CarFront className="size-4" />}
              action={
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#5B5296] ring-1 ring-[#b7b3ff]/60">
                  {selectedDriver.vehicles?.length ?? 0} total
                </span>
              }
            >
              {selectedDriver.vehicles?.length ? (
                <div className="overflow-x-auto rounded-[14px] ring-1 ring-slate-200">
                  <div className="min-w-190">
                    <div className="grid grid-cols-[1.1fr_1.8fr_1.2fr_0.8fr_0.7fr] items-center bg-[#f4f6fe] px-5 py-3 text-xs font-bold uppercase tracking-[0.6px] text-[#5B5296]">
                      <div>Plate Number</div>
                      <div>Vehicle</div>
                      <div>Type</div>
                      <div>Color</div>
                      <div className="text-right">Action</div>
                    </div>
                    {selectedDriver.vehicles.map((vehicle) => (
                      <div
                        key={vehicle.plate_number}
                        className="grid grid-cols-[1.1fr_1.8fr_1.2fr_0.8fr_0.7fr] items-center border-t border-slate-200 bg-white px-5 py-4 text-[15px] text-slate-900"
                      >
                        <div className="font-bold">{vehicle.plate_number}</div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{`${vehicle.make} ${vehicle.model}`.trim()}</div>
                          <div className="mt-0.5 text-sm text-slate-500">{vehicle.year}</div>
                        </div>
                        <div className="text-slate-600">{vehicle.vehicle_type}</div>
                        <div className="text-slate-600">{vehicle.color}</div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onNavigate?.({
                                key: 'vehicles',
                                plateNumber: vehicle.plate_number,
                                returnTo: {
                                  key: 'drivers',
                                  driverLicenseNumber: selectedDriver.license_number,
                                  returnTo: returnTo ?? null,
                                },
                              })
                            }}
                            className="grid size-9 place-items-center rounded-xl bg-[#f4f6fe] text-[#8981d2] ring-1 ring-[#b7b3ff]/60 hover:bg-[#ebeefe]"
                            aria-label={`View vehicle ${vehicle.plate_number}`}
                            title={`View vehicle ${vehicle.plate_number}`}
                          >
                            <ChevronRight className="size-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[14px] bg-[#f8f9ff] px-5 py-6 text-center text-sm font-medium text-slate-500 ring-1 ring-slate-200">
                  No vehicles owned.
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Traffic Violations"
              icon={<MessageCircleWarning className="size-4" />}
              action={
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#5B5296] ring-1 ring-[#b7b3ff]/60">
                  {selectedDriver.violations?.length ?? 0} total
                </span>
              }
            >
              {selectedDriver.violations?.length ? (
                <div className="overflow-x-auto rounded-[14px] ring-1 ring-slate-200">
                  <div className="min-w-225">
                    <div className="grid grid-cols-[1.1fr_2fr_1fr_1fr_1fr_0.7fr] items-center bg-[#f4f6fe] px-5 py-3 text-xs font-bold uppercase tracking-[0.6px] text-[#5B5296]">
                      <div>Ticket Number</div>
                      <div>Violation</div>
                      <div>Date</div>
                      <div>Fine</div>
                      <div>Status</div>
                      <div className="text-right">Action</div>
                    </div>
                    {selectedDriver.violations.map((violation) => (
                      <div
                        key={violation.violation_id}
                        className="grid grid-cols-[1.1fr_2fr_1fr_1fr_1fr_0.7fr] items-center border-t border-slate-200 bg-white px-5 py-4 text-[15px] text-slate-900"
                      >
                        <div className="font-bold">{violation.violation_id}</div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{violation.violation_type}</div>
                          <div className="mt-0.5 text-sm text-slate-500">{violation.plate_number}</div>
                        </div>
                        <div className="text-slate-600">{violation.violation_date}</div>
                        <div className="font-semibold text-slate-700">{formatMoney(violation.violation_fine)}</div>
                        <div>
                          <StatusPill tone={violationTone(violation.violation_status)}>
                            {violation.violation_status}
                          </StatusPill>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onNavigate?.({
                                key: 'violations',
                                violationId: violation.violation_id,
                                returnTo: {
                                  key: 'drivers',
                                  driverLicenseNumber: selectedDriver.license_number,
                                  returnTo: returnTo ?? null,
                                },
                              })
                            }}
                            className="grid size-9 place-items-center rounded-xl bg-[#f4f6fe] text-[#8981d2] ring-1 ring-[#b7b3ff]/60 hover:bg-[#ebeefe]"
                            aria-label={`View violation ${violation.violation_id}`}
                            title={`View violation ${violation.violation_id}`}
                          >
                            <ChevronRight className="size-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[14px] bg-[#f8f9ff] px-5 py-6 text-center text-sm font-medium text-slate-500 ring-1 ring-slate-200">
                  No traffic violations.
                </div>
              )}
            </SectionCard>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  if (returnTo) return onNavigate?.(returnTo)
                  setView('list')
                }}
              >
                {returnTo ? 'Back' : 'Back to List'}
              </Button>
            </div>
          </div>

        </div>
      </AppFrame>
    )
  }

  // drivers search form
  return (
    <AppFrame activeKey="drivers" onNavigate={onNavigate}>
      <div className="p-3">
        <PageHeader
          title="Drivers"
          subtitle="List, view, edit, and manage driver records."
          action={
            <Button leftIcon={<Plus className="size-5" />} onClick={() => setView('create')}>
              Add Driver
            </Button>
          }
        />

        <div className="mt-6 rounded-2xl border border-[#8981d2] bg-[#f4f6fe] p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or license number..."
              />
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <div className="w-full md:w-55">
                <Combobox
                  leftIcon={<Filter className="size-5" />}
                  value={status}
                  onChange={(v) => setStatus(v)}
                  options={statusFilterOptions}
                  placeholder="Status"
                  searchable={false}
                />
              </div>

              <div className="w-full md:w-55">
                <Combobox
                  leftIcon={<IdCard className="size-5" />}
                  value={licenseType}
                  onChange={(v) => setLicenseType(v)}
                  options={licenseTypeFilterOptions}
                  placeholder="License Type"
                  searchable={false}
                />
              </div>

              <div className="w-full md:w-55">
                <Combobox
                  leftIcon={<ArrowDownUp className="size-5" />}
                  value={sort}
                  onChange={(v) => setSort(v)}
                  options={sortOptions}
                  placeholder="Sort"
                  searchable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          <DataTable columns={columns} rows={drivers} getRowKey={(row) => row.id} />
        </div>

        {loading ? <div className="mt-4 text-sm text-slate-500">Loading...</div> : null}
      </div>
    </AppFrame>
  )
}
