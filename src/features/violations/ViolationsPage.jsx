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
  ClipboardList,
  CarFront,
  MessageCircleWarning
} from 'lucide-react'
import {
  AppFrame,
  Button,
  Combobox,
  DataTable,
  PageHeader,
  SearchInput,
  SectionCard,
  StatusPill
} from '../../components/index.js'
import { createViolation, deleteViolation, getViolation, listViolations, updateViolation } from '../../api/violations.js'
import { formatLicenseNumber } from '../../lib/licenseNumber.js'
import ViolationForm from './ViolationForm.jsx'
import { listRowFromApi, toStatusTone } from './violationMappers.js'
import ViolationDetailsHero from '../../components/display/ViolationDetailsHero.jsx'

const violationStatusFilters = [
  { value: '', label: 'All' },
  { value: 'Unpaid', label: 'Unpaid' },
  { value: 'Contested', label: 'Contested' },
  { value: 'Paid', label: 'Paid' },
]

export default function ViolationsPage({ onNavigate, openViolationId, returnTo }) {
  const [view, setView] = useState('list') // list | create | edit | details
  const [selectedViolationId, setSelectedViolationId] = useState(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [violations, setViolations] = useState([])
  const [selectedViolation, setSelectedViolation] = useState(null)

  const refreshList = useCallback(async () => {
    const rows = await listViolations({ search, status })
    setViolations(rows.map(listRowFromApi))
  }, [search, status])

const openDetails = useCallback(async (violationId) => {
  if (!violationId) return; // Guard against empty IDs
  setError('')
  setLoading(true)
  try {
    const violation = await getViolation(violationId)
    setSelectedViolation(violation)
    setSelectedViolationId(violationId)
    setView('details')
  } catch (e) {
    console.error(e)
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
        const rows = await listViolations({ search, status })
        if (!cancelled) setViolations(rows.map(listRowFromApi))
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
  if (!openViolationId) return

  async function handleAutoOpen() {
    await openDetails(openViolationId)
    onNavigate?.({ key: 'violations', openViolationId: null, returnTo: returnTo ?? null })
  }

  handleAutoOpen()
}, [openViolationId, openDetails, onNavigate, returnTo])



  async function openEdit(violationId) {
    setError('')
    setLoading(true)
    try {
      const violation = await getViolation(violationId)
      setSelectedViolation(violation)
      setSelectedViolationId(violationId)
      setView('edit')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(violationId) {
    setError('')
    setSaving(true)
    try {
      await deleteViolation(violationId)
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
      await createViolation(values)
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
      await updateViolation(selectedViolationId, values)
      setView('list')
      setSelectedViolation(null)
      setSelectedViolationId(null)
      await refreshList()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'violationId',
      header: 'Ticket Number',
      width: 160,
      render: (row) => <span className="font-medium">{row.violationId}</span>,
    },
    { key: 'driver', header: 'Driver', width: 220, render: (row) => <span className="text-slate-600">{row.driverName}</span> },
    { key: 'violationType', header: 'Violation', width: 220, render: (row) => <span className="text-slate-600">{row.violationType}</span> },
    { key: 'date', header: 'Date', width: 220, render: (row) => <span className="text-slate-600">{row.date}</span> },
    { key: 'violationFine', header: 'Fine Amount', width: 220, render: (row) => <span className="text-slate-600">{row.violationFine}</span> },
    {
      key: 'status',
      header: 'Status',
      width: 160,
      render: (row) => (
        <StatusPill tone={row.statusTone}>{row.statusLabel}</StatusPill>
      ),
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
            onClick={() => openDetails(row.violationId)}
            className="grid size-9 place-items-center rounded-xl bg-white cursor-pointer disabled:cursor-not-allowed"
            aria-label="View"
            title="View"
          >
            <Eye className="size-4 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={() => openEdit(row.violationId)}
            className="grid size-9 place-items-center rounded-xl bg-white cursor-pointer disabled:cursor-not-allowed "
            aria-label="Edit"
            title="Edit"
          >
            <Pencil className="size-4 text-[#26BA84]" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.violationId)}
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
      <AppFrame activeKey="violations" onNavigate={onNavigate}>
        <div className="p-3">
          <PageHeader
            leading={
              <button
                type="button"
                onClick={() => setView('list')}
                className="grid size-11 place-items-center rounded-[14px] bg-[#F4FBF5] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Back"
                title="Back"
              >
                <ArrowLeft className="size-6 text-[#3EC191]" />
              </button>
            }
            title={view === 'create' ? 'File New Violation' : 'Edit Violation'}
            subtitle={view === 'create' ? 'File a new violation in the system' : 'Edit an existing violation'}
          />

          {error ? (
            <div className="mt-6 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6">
            <ViolationForm
              key={view === 'edit' ? (selectedViolation?.violation_id ?? 'edit') : 'create'}
              initialValues={view === 'edit' ? selectedViolation : null}
              onSubmit={view === 'edit' ? handleUpdate : handleCreate}
              onCancel={() => setView('list')}
              saving={saving}
              submitLabel="Save Violation"
            />
          </div>
        </div>
      </AppFrame>
    )
  }

  if (view === 'details' && selectedViolation) {

    const statusNode = (
      <StatusPill
        tone={toStatusTone(selectedViolation.violation_status)}
        className="bg-[#d1fae5] text-[#0f7a33] ring-0"
      >
        {selectedViolation.violation_status}
      </StatusPill>
    )
    

    return (
      <AppFrame activeKey="violations" onNavigate={onNavigate}>
        <div className="p-3">
          <PageHeader
            leading={
              <button
                type="button"
                onClick={() => {
                  if (returnTo) return onNavigate?.(returnTo)
                  setView('list')
                }}
                className="grid size-12 place-items-center rounded-[14px] bg-[#E4FBF0] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Back"
                title="Back"
              >
                <ArrowLeft className="size-6 text-[#26BA84]" />
              </button>
            }
            title="Violation Details"
            subtitle={`${selectedViolation.violation_id}`}
            action={
              <Button variant="green" leftIcon={<Pencil className="size-5" />} onClick={() => openEdit(selectedViolation.violation_id)}>
                Edit Violation
              </Button>
            }
          />

          <div className="mt-6 space-y-6">
            <ViolationDetailsHero
              violationId={selectedViolation.violation_id}
              violationType={selectedViolation.violation_type}
              violationStatus={statusNode}
              date={selectedViolation.violation_date}
              apprehendingOfficer={selectedViolation.apprehending_officer}
              violationFine={selectedViolation.violation_fine}
              addressLine1={`${selectedViolation.location?.street}, ${selectedViolation.location?.city}`}
              addressLine2={`${selectedViolation.location?.region}, ${selectedViolation.location?.province}`}

              driverName={selectedViolation.driver?.full_name ?? ''}
              driverLicense={formatLicenseNumber(selectedViolation.driver?.license_number ?? '')}           
              vehicleName={`${selectedViolation.vehicle?.make ?? ''} ${selectedViolation.vehicle?.model ?? ''}`.trim()}
              vehicleSub={`${selectedViolation.vehicle?.year ?? ''} • ${selectedViolation.vehicle?.plate_number ?? ''} • ${selectedViolation.vehicle?.type ?? ''}`}
            />


            {selectedViolation.violation_status === 'Unpaid' && (

              <SectionCard title="Payment Required" accent="critical" icon={<MessageCircleWarning size={32} color="#E00000" />}>
                <p>This violation has not been paid. Please settle the fine amount of ₱{selectedViolation.violation_fine}.</p>
              </SectionCard>
            )}

            {selectedViolation.violation_status === 'Contested' && (
              <SectionCard
                title="Fine Under Review"
                accent="warn"
                icon={<MessageCircleWarning size={32} color="#F68B0E" />}
              >
                <p>
                  This violation is currently under contest. The fine amount of ₱
                  {selectedViolation.violation_fine} is pending review and may be adjusted
                  depending on the outcome of the dispute.
                </p>
              </SectionCard>
            )}

                        <SectionCard title="Driver Information" accent="green">
              <button
                type="button"
                disabled={!selectedViolation.driver?.license_number}
                onClick={() => {
                  const licenseNumber = selectedViolation.driver?.license_number
                  if (!licenseNumber) return
                  onNavigate?.({
                    key: 'drivers',
                    driverLicenseNumber: licenseNumber,
                    returnTo: { key: 'violations', violationId: selectedViolation.violation_id },
                  })
                }}
                className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 enabled:cursor-pointer enabled:hover:bg-slate-50 disabled:opacity-60"
                aria-label={selectedViolation.driver?.license_number ? 'View driver details' : 'Driver not available'}
                title={selectedViolation.driver?.license_number ? 'View driver details' : 'Driver not available'}
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-[#E4FBF0] text-[#26BA84] ring-1 ring-[#26BA84]/40">
                  <User className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{selectedViolation.driver?.full_name}</div>
                  <div className="mt-0.5 text-sm text-slate-500">
                    License: {formatLicenseNumber(selectedViolation.driver?.license_number ?? '')}
                  </div>
                </div>
                <ChevronRight className="size-5 shrink-0 text-slate-400" />
              </button>
            </SectionCard>


						<SectionCard title="Vehicle Information" accent="green">
							<button
								type="button"
								disabled={!selectedViolation.vehicle?.plate_number}
								onClick={() => {
									const licensePlate = selectedViolation.vehicle?.plate_number
									if (!licensePlate) return
									onNavigate?.({
										key: 'vehicles',
										plateNumber: licensePlate,
                    returnTo: { key: 'violations', violationId: selectedViolation.violation_id },
									})
								}}
								className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 enabled:cursor-pointer enabled:hover:bg-slate-50 disabled:opacity-60"
								aria-label={selectedViolation.vehicle?.plate_number ? 'View vehicle details' : 'Vehicle not available'}
								title={selectedViolation.vehicle?.plate_number ? 'View vehicle details' : 'Vehicle not available'}
							>
								<div className="grid size-12 place-items-center rounded-2xl bg-[#E4FBF0] text-[#26BA84] ring-1 ring-[#26BA84]/40">
									<CarFront className="size-5" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="truncate font-semibold">{selectedViolation.vehicle?.plate_number}</div>
									<div className="mt-0.5 text-sm text-slate-500">
										{`${selectedViolation.vehicle?.make} ${selectedViolation.vehicle?.model} (${selectedViolation.vehicle?.year})`}
									</div>
								</div>
								<ChevronRight className="size-5 shrink-0 text-slate-400" />
							</button>
						</SectionCard>

            <SectionCard title="Location Information" accent="green">
              <p>{selectedViolation.location?.street}, {selectedViolation.location?.city}</p>
              <p>{selectedViolation.location?.province}, {selectedViolation.location?.region}</p>
            </SectionCard>


          </div>
        </div>
      </AppFrame>
    )
  }

  return (
    <AppFrame activeKey="violations" onNavigate={onNavigate}>
      <div className="p-3">
        <PageHeader
          title="Violations"
          subtitle="List, view, edit, and manage violation records."
          action={
            <Button variant="green" leftIcon={<Plus className="size-5" />} onClick={() => setView('create')}>
              Add Violation
            </Button>
          }
        />

        <div className="mt-6 rounded-2xl border border-[#26BA84] bg-[#E4FBF0] p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ticket number, driver, violation type, date, or fine amount..."
              />
            </div>

            <div className="w-full md:w-70">
              <Combobox
                leftIcon={<Filter className="size-5" />}
                value={status}
                onChange={(v) => setStatus(v)}
                options={violationStatusFilters}
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
            theadClassName="!bg-[#E4FBF0]"
            columns={columns}
            rows={violations}
            getRowKey={(row) => row.violationId}
          />
        </div>

        {loading ? <div className="mt-4 text-sm text-slate-500">Loading...</div> : null}
      </div>
    </AppFrame>
  )
}
