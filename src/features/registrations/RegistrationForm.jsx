import { useEffect, useMemo, useState } from 'react'
import { Calendar, Search } from 'lucide-react'
import { Button, Combobox, FormField, TextInput, SelectInput, SectionCard } from '../../components/index.js'
import { listVehicles } from '../../api/vehicles.js'

const registrationStatusOptions = [
	{ value: 'Active', label: 'Active' },
	{ value: 'Expired', label: 'Expired' },
	{ value: 'Suspended', label: 'Suspended' },
]

function isoToday() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function RegistrationForm({
  initialValues,
  onSubmit,
  onCancel,
  saving,
  submitLabel = 'Save Registration',
}) {
  const [registrationNumber, setRegistrationNumber] = useState(() => initialValues?.registration_number ?? '')
  const [registrationStatus, setRegistrationStatus] = useState(() => initialValues?.registration_status ?? 'Active')
  const [registrationDate, setRegistrationDate] = useState(() => initialValues?.registration_date ?? isoToday())
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState(() => initialValues?.vehicle?.plate_number ?? '')
  const [expirationDate, setExpirationDate] = useState(() => initialValues?.expiration_date ?? isoToday())

  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const rows = await listVehicles()
        if (!cancelled) setVehicles(rows)
      } catch {
        if (!cancelled) setVehicles([])
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const vehicleOptions = useMemo(() => {
    return (vehicles ?? []).map((v) => ({
      value: v.plate_number,
      label: `${v.make} ${v.model} (${v.year})`,
      selectedLabel: `${v.make} ${v.model} (${v.year})`,
      description: `Plate Number: ${v.plate_number}`,
    }))
  }, [vehicles])

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit?.({
      registration_number: registrationNumber,
      registration_status: registrationStatus,
      registration_date: registrationDate,
      expiration_date: expirationDate,
      vehicle_plate_number: vehiclePlateNumber,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Vehicle Information" accent="orange">
        <FormField label="Search Vehicle" required>
          <Combobox
            leftIcon={<Search className="size-5" />}
            value={vehiclePlateNumber}
            onChange={(v) => setVehiclePlateNumber(v)}
            options={vehicleOptions}
            placeholder="Search by vehicle or plate number..."
            searchPlaceholder="Search by vehicle or plate number..."
          />
        </FormField>
      </SectionCard>

      <SectionCard title="Registration Information" accent="orange">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField label="Registration Number" required>
              <TextInput
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="11111111111"
                maxLength={11}
                autoComplete="off"
              />
            </FormField>
          </div>
          
          <FormField label="Registration Date" required>
            <TextInput
              leftIcon={<Calendar className="size-5" />}
              type="date"
              value={registrationDate}
              onChange={(e) =>  setRegistrationDate(e.target.value)}
            />
          </FormField>
          
          <FormField label="Expiration Date" required>
            <TextInput
              leftIcon={<Calendar className="size-5" />}
              type="date"
              value={expirationDate}
              onChange={(e) =>  setExpirationDate(e.target.value)}
            />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Registration Status" required>
              <SelectInput
                value={registrationStatus}
                onChange={(e) => setRegistrationStatus(e.target.value)}
                aria-label="Registration status"
              >
                {registrationStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant="orange" type="submit" disabled={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
