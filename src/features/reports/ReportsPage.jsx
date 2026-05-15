import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Car,
  ClipboardCheck,
  Download,
  FileBarChart2,
  Filter,
  IdCard,
  ListChecks,
  MapPin,
  Search,
  User,
  Users,
} from 'lucide-react'
import {
  AppFrame,
  Button,
  DataTable,
  FormField,
  PageHeader,
  SelectInput,
  TextInput,
} from '../../components/index.js'
import { getReport } from '../../api/reports.js'
import { cn } from '../../lib/cn.js'
import { formatLicenseNumber } from '../../lib/licenseNumber.js'

const today = new Date().toISOString().slice(0, 10)

const reportTypes = [
  {
    key: 'drivers-by-license-type',
    title: 'Drivers by License Type',
    description: 'View all registered drivers filtered by license type, status, age range, and sex',
    icon: Users,
  },
  {
    key: 'vehicles-by-owner',
    title: 'Vehicles by Owner',
    description: 'View all vehicles owned by a specific driver',
    icon: Car,
  },
  {
    key: 'expired-vehicle-registrations',
    title: 'Expired Vehicle Registrations',
    description: 'View all vehicles with expired registrations as of a given date',
    icon: CalendarDays,
  },
  {
    key: 'expired-suspended-licenses',
    title: 'Expired/Suspended Licenses',
    description: 'View all drivers with expired or suspended licenses',
    icon: IdCard,
  },
  {
    key: 'violations-by-driver',
    title: 'Violations by Driver',
    description: 'View all traffic violations committed by a specific driver within a date range',
    icon: User,
  },
  {
    key: 'violations-by-type',
    title: 'Violations by Type',
    description: 'View total number of violations per violation type for a given year',
    icon: ListChecks,
  },
  {
    key: 'violations-by-location',
    title: 'Violations by Location',
    description: 'View all vehicles involved in violations within a specific city or region',
    icon: MapPin,
  },
]

const defaultFilters = {
  'drivers-by-license-type': {
    licenseType: 'Professional',
    status: 'Valid',
    sex: '',
    ageFrom: '',
    ageTo: '',
  },
  'vehicles-by-owner': { search: '' },
  'expired-vehicle-registrations': { asOfDate: today },
  'expired-suspended-licenses': { status: '' },
  'violations-by-driver': { search: '', dateFrom: '', dateTo: '' },
  'violations-by-type': { year: String(new Date().getFullYear()) },
  'violations-by-location': { city: '', region: '' },
}

const resultColumns = {
  'drivers-by-license-type': [
    { key: 'name', header: 'Name', render: (row) => row.name },
    {
      key: 'licenseNumber',
      header: 'License Number',
      render: (row) => formatLicenseNumber(row.licenseNumber),
    },
    { key: 'licenseType', header: 'License Type', render: (row) => row.licenseType },
    { key: 'status', header: 'Status', render: (row) => row.status },
    { key: 'age', header: 'Age', width: 110, render: (row) => row.age },
    { key: 'sex', header: 'Sex', width: 140, render: (row) => row.sex },
  ],
  'vehicles-by-owner': [
    { key: 'name', header: 'Name', render: (row) => row.name },
    { key: 'plateNumber', header: 'Plate Number', render: (row) => row.plateNumber },
    { key: 'vehicle', header: 'Vehicle', render: (row) => row.vehicle },
    { key: 'type', header: 'Type', render: (row) => row.type },
    {
      key: 'registrationStatus',
      header: 'Registration Status',
      render: (row) => row.registrationStatus,
    },
  ],
  'expired-vehicle-registrations': [
    { key: 'plateNumber', header: 'Plate Number', render: (row) => row.plateNumber },
    { key: 'vehicle', header: 'Vehicle', render: (row) => row.vehicle },
    { key: 'owner', header: 'Owner', render: (row) => row.owner },
    { key: 'expirationDate', header: 'Expiration Date', render: (row) => row.expirationDate },
    { key: 'daysExpired', header: 'Days Expired', render: (row) => row.daysExpired },
  ],
  'expired-suspended-licenses': [
    { key: 'name', header: 'Name', render: (row) => row.name },
    {
      key: 'licenseNumber',
      header: 'License Number',
      render: (row) => formatLicenseNumber(row.licenseNumber),
    },
    { key: 'type', header: 'Type', render: (row) => row.type },
    { key: 'status', header: 'Status', render: (row) => row.status },
    { key: 'expirationDate', header: 'Expiration Date', render: (row) => row.expirationDate },
  ],
  'violations-by-driver': [
    { key: 'name', header: 'Name', render: (row) => row.name },
    { key: 'ticketNumber', header: 'Ticket Number', render: (row) => row.ticketNumber },
    { key: 'violationType', header: 'Violation Type', render: (row) => row.violationType },
    { key: 'date', header: 'Date', render: (row) => row.date },
    { key: 'location', header: 'Location', render: (row) => row.location },
    { key: 'fine', header: 'Fine', render: (row) => row.fine },
    { key: 'status', header: 'Status', render: (row) => row.status },
  ],
  'violations-by-type': [
    { key: 'violationType', header: 'Violation Type', render: (row) => row.violationType },
    { key: 'totalCount', header: 'Total Count', render: (row) => row.totalCount },
  ],
  'violations-by-location': [
    { key: 'plateNumber', header: 'Plate Number', render: (row) => row.plateNumber },
    { key: 'vehicle', header: 'Vehicle', render: (row) => row.vehicle },
    { key: 'driver', header: 'Driver', render: (row) => row.driver },
    { key: 'violationType', header: 'Violation Type', render: (row) => row.violationType },
    { key: 'date', header: 'Date', render: (row) => row.date },
  ],
}

function reportTitle(key) {
  return reportTypes.find((type) => type.key === key)?.title ?? 'Report'
}

function ReportTypeCard({ report, active, onClick }) {
  const Icon = report.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-36 w-full gap-4 rounded-[16px] border p-5 text-left shadow-sm transition',
        'hover:border-blue-400 hover:shadow-md',
        active ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'bg-white border-slate-200',
      )}
    >
      <div className={cn('grid size-11 shrink-0 place-items-center rounded-[14px]', active ? 'bg-blue-500 text-white' : 'bg-blue-150 text-blue-500')}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 mt-3">
        <span className="block text-[18px] font-bold leading-7 text-slate-900">{report.title}</span>
        <span className="mt-2 block text-sm leading-5 text-slate-500">{report.description}</span>
      </div>
    </button>
  )
}

function ReportPanel({ title, icon, action, children, className }) {
  return (
    <section className={cn('overflow-hidden rounded-[16px] border border-blue-500 bg-white shadow-md', className)}>
      <div className="flex min-h-15 items-center justify-between gap-4 bg-blue-50 px-6 py-4">
        <div className="flex items-center gap-2 text-[18px] font-bold text-blue-500">
          {icon}
          <span>{title}</span>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

function FilterControls({ selectedType, filters, setFilters }) {
  function update(key, value) {
    setFilters((current) => ({ ...current, [selectedType]: { ...current[selectedType], [key]: value } }))
  }

  const f = filters[selectedType] ?? {}

  if (selectedType === 'drivers-by-license-type') {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField label="License Type">
          <SelectInput value={f.licenseType} onChange={(e) => update('licenseType', e.target.value)}>
            <option value="">All</option>
            <option>Student Permit</option>
            <option>Non-Professional</option>
            <option>Professional</option>
          </SelectInput>
        </FormField>
        <FormField label="License Status">
          <SelectInput value={f.status} onChange={(e) => update('status', e.target.value)}>
            <option value="">All</option>
            <option>Valid</option>
            <option>Expired</option>
            <option>Suspended</option>
            <option>Revoked</option>
          </SelectInput>
        </FormField>
        <FormField label="Sex">
          <SelectInput value={f.sex} onChange={(e) => update('sex', e.target.value)}>
            <option value="">All</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </SelectInput>
        </FormField>
        <FormField label="Age From">
          <TextInput type="number" min="0" value={f.ageFrom} onChange={(e) => update('ageFrom', e.target.value)} placeholder="Min age" />
        </FormField>
        <FormField label="Age To">
          <TextInput type="number" min="0" value={f.ageTo} onChange={(e) => update('ageTo', e.target.value)} placeholder="Max age" />
        </FormField>
      </div>
    )
  }

  if (selectedType === 'vehicles-by-owner') {
    return (
      <FormField label="Driver Name or License Number">
        <TextInput leftIcon={<Search className="size-5" />} value={f.search} onChange={(e) => update('search', e.target.value)} placeholder="Search driver..." />
      </FormField>
    )
  }

  if (selectedType === 'expired-vehicle-registrations') {
    return (
      <FormField label="As of Date" className="max-w-xl">
        <TextInput type="date" value={f.asOfDate} onChange={(e) => update('asOfDate', e.target.value)} />
      </FormField>
    )
  }

  if (selectedType === 'expired-suspended-licenses') {
    return (
      <FormField label="License Status" className="max-w-xl">
        <SelectInput value={f.status} onChange={(e) => update('status', e.target.value)}>
          <option value="">Expired and Suspended</option>
          <option>Expired</option>
          <option>Suspended</option>
        </SelectInput>
      </FormField>
    )
  }

  if (selectedType === 'violations-by-driver') {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField label="Driver Name or License Number">
          <TextInput leftIcon={<Search className="size-5" />} value={f.search} onChange={(e) => update('search', e.target.value)} placeholder="Search driver..." />
        </FormField>
        <FormField label="Date From">
          <TextInput type="date" value={f.dateFrom} onChange={(e) => update('dateFrom', e.target.value)} />
        </FormField>
        <FormField label="Date To">
          <TextInput type="date" value={f.dateTo} onChange={(e) => update('dateTo', e.target.value)} />
        </FormField>
      </div>
    )
  }

  if (selectedType === 'violations-by-type') {
    return (
      <FormField label="Year" className="max-w-xl">
        <TextInput type="number" min="1900" max="2100" value={f.year} onChange={(e) => update('year', e.target.value)} />
      </FormField>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FormField label="City/Municipality">
        <TextInput value={f.city} onChange={(e) => update('city', e.target.value)} placeholder="e.g., Quezon City" />
      </FormField>
      <FormField label="Region">
        <TextInput value={f.region} onChange={(e) => update('region', e.target.value)} placeholder="e.g., Metro Manila" />
      </FormField>
    </div>
  )
}

function downloadCsv(filename, columns, rows) {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const header = columns.map((column) => escape(column.header)).join(',')
  const body = rows.map((row) => columns.map((column) => escape(row[column.key])).join(',')).join('\n')
  const blob = new Blob([[header, body].filter(Boolean).join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage({ onNavigate }) {
  const [selectedType, setSelectedType] = useState('')
  const [filters, setFilters] = useState(defaultFilters)
  const [rows, setRows] = useState([])
  const [generatedType, setGeneratedType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const columns = useMemo(() => resultColumns[generatedType] ?? [], [generatedType])

  async function handleGenerate() {
    if (!selectedType) return
    setLoading(true)
    setError('')
    try {
      const report = await getReport(selectedType, filters[selectedType])
      setRows(report.rows ?? [])
      setGeneratedType(selectedType)
    } catch (e) {
      setError(e.message)
      setRows([])
      setGeneratedType(selectedType)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    if (!selectedType) return
    setFilters((current) => ({ ...current, [selectedType]: defaultFilters[selectedType] }))
    setRows([])
    setGeneratedType('')
    setError('')
  }

  return (
    <AppFrame activeKey="reports" onNavigate={onNavigate}>
      <div className="p-3">
        <PageHeader
          title="Reports & Analytics"
          subtitle="Generate comprehensive reports and analytics for LTO records."
        />

        <div className="mt-6 rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[18px] font-bold text-slate-900">
            <FileBarChart2 className="size-5 text-blue-500" />
            <span>Select Report Type</span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reportTypes.map((report) => (
              <ReportTypeCard
                key={report.key}
                report={report}
                active={selectedType === report.key}
                onClick={() => {
                  setSelectedType(report.key)
                  setRows([])
                  setGeneratedType('')
                  setError('')
                }}
              />
            ))}
          </div>
        </div>

        {selectedType ? (
          <div className="mt-6">
            <ReportPanel title="Report Filters" icon={<Filter className="size-5" />}>
              <FilterControls selectedType={selectedType} filters={filters} setFilters={setFilters} />
              <div className="mt-6 flex flex-wrap gap-4">
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  leftIcon={<ClipboardCheck className="size-5" />}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
                <Button variant="secondary" onClick={handleClear}>Clear filters</Button>
                {rows.length ? (
                  <Button
                    variant="secondary"
                    leftIcon={<Download className="size-5" />}
                    onClick={() => downloadCsv(`${generatedType}.csv`, columns, rows)}
                  >
                    Export to CSV
                  </Button>
                ) : null}
              </div>
            </ReportPanel>
          </div>
        ) : (
          <div className="mt-6 rounded-[16px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-[18px] font-bold text-slate-900">No Report Selected</div>
            <div className="mt-2 text-sm text-slate-500">Please select a report type above to begin generating reports.</div>
          </div>
        )}

        {error ? (
          <div className="mt-6 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {generatedType ? (
          <div className="mt-6">
            <ReportPanel
              title="Report Results"
              icon={<ClipboardCheck className="size-5" />}
              action={
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-blue-500">
                  {rows.length} {rows.length === 1 ? 'Record' : 'Records'}
                </span>
              }
              className="overflow-hidden"
            >
              {rows.length ? (
                <div className="-m-6">
                  <DataTable
                    columns={columns}
                    rows={rows}
                    getRowKey={(row, index) => `${generatedType}-${index}`}
                    className="rounded-none shadow-none ring-0"
                    theadClassName="bg-blue-50"
                    rowClassName="last:border-b-0"
                  />
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  No records found for {reportTitle(generatedType).toLowerCase()}.
                </div>
              )}
            </ReportPanel>
          </div>
        ) : null}
      </div>
    </AppFrame>
  )
}
