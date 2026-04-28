import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Button, Combobox, FormField, TextInput, SectionCard } from '../../components/index.js'
import { listDrivers } from '../../api/drivers.js'
import { formatLicenseNumber } from '../../lib/licenseNumber.js'

const vehicleTypeOptions = [
  { value: 'Private Car', label: 'Private Car' },
  { value: 'Motorcycle', label: 'Motorcycle' },
  { value: 'Public Utility Vehicle', label: 'Public Utility Vehicle' },
]

function normalizePlateInput(value) {
  const raw = String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7)

  if (raw.length <= 3) return raw
  return `${raw.slice(0, 3)}-${raw.slice(3)}`
}

export default function VehicleForm({
  initialValues,
  onSubmit,
  onCancel,
  saving,
  submitLabel = 'Save Changes',
}) {
  const [plateNumber, setPlateNumber] = useState(() => initialValues?.plate_number ?? '')
  const [engineNumber, setEngineNumber] = useState(() => initialValues?.engine_number ?? '')
  const [chassisNumber, setChassisNumber] = useState(() => initialValues?.chassis_number ?? '')
  const [ownerLicenseNumber, setOwnerLicenseNumber] = useState(() => initialValues?.owner?.license_number ?? initialValues?.owner_license_number ?? '')
  const [vehicleType, setVehicleType] = useState(() => initialValues?.vehicle_type ?? '')
  const [make, setMake] = useState(() => initialValues?.make ?? '')
  const [model, setModel] = useState(() => initialValues?.model ?? '')
  const [year, setYear] = useState(() => initialValues?.year ?? '')
  const [color, setColor] = useState(() => initialValues?.color ?? '')

  const [drivers, setDrivers] = useState([])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const rows = await listDrivers()
        if (!cancelled) setDrivers(rows)
      } catch {
        if (!cancelled) setDrivers([])
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const driverOptions = useMemo(() => {
    return (drivers ?? []).map((d) => ({
      value: d.license_number,
      label: d.full_name,
      selectedLabel: d.full_name,
      description: `License: ${formatLicenseNumber(d.license_number)}`,
    }))
  }, [drivers])

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit?.({
      plate_number: plateNumber,
      engine_number: engineNumber,
      chassis_number: chassisNumber,
      owner_license_number: ownerLicenseNumber,
      vehicle_type: vehicleType,
      make,
      model,
      year: Number(year),
      color,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Vehicle Identification" accent="pink">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label="Plate Number" required>
            <TextInput
              value={plateNumber}
              onChange={(e) => setPlateNumber(normalizePlateInput(e.target.value))}
              placeholder="ABC-1234"
              maxLength={8}
              autoComplete="off"
            />
          </FormField>

          <FormField label="Engine Number" required>
            <TextInput
              value={engineNumber}
              onChange={(e) => setEngineNumber(e.target.value)}
              placeholder="4G18-AB123456"
              maxLength={32}
              autoComplete="off"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Chassis Number" required>
              <TextInput
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                placeholder="MH8AB5678901234567"
                maxLength={32}
                autoComplete="off"
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Owner Information" accent="pink">
        <FormField label="Search Owner (Driver)" required>
          <Combobox
            leftIcon={<Search className="size-5" />}
            value={ownerLicenseNumber}
            onChange={(v) => setOwnerLicenseNumber(v)}
            options={driverOptions}
            placeholder="Search by name or license number..."
            searchPlaceholder="Search by name or license number..."
          />
        </FormField>
      </SectionCard>

      <SectionCard title="Vehicle Details" accent="pink">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label="Vehicle Type" required>
            <TextInput
              list="vehicle_type_suggestions"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              placeholder="e.g. Private Car"
              maxLength={80}
              autoComplete="off"
            />
            <datalist id="vehicle_type_suggestions">
              {vehicleTypeOptions.map((o) => (
                <option key={o.value} value={o.value} />
              ))}
            </datalist>
          </FormField>

          <FormField label="Make" required>
            <TextInput
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="Toyota"
              maxLength={64}
              autoComplete="off"
            />
          </FormField>

          <FormField label="Model" required>
            <TextInput
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Vios"
              maxLength={64}
              autoComplete="off"
            />
          </FormField>

          <FormField label="Year" required>
            <TextInput
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
              placeholder="2024"
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Color" required>
              <TextInput
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="White"
                maxLength={32}
                autoComplete="off"
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant="pink" type="submit" disabled={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
