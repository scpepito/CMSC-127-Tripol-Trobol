import { useEffect, useMemo, useState } from 'react'
import { MapPin, Search, ShieldCheck, Triangle, TriangleAlert, Calendar, User, Car, PhilippinePeso } from 'lucide-react'
import { Button, Combobox, FormField, TextInput, SectionCard, SelectInput } from '../../components/index.js'
import { listDrivers } from '../../api/drivers.js'
import { listVehicles } from '../../api/vehicles.js' 
import { formatLicenseNumber } from '../../lib/licenseNumber.js'
import { PH_CITIES_MUNICIPALITIES } from '../../data/ph/cities-municipalities.js'
import { PH_REGIONS } from '../../data/ph/regions.js'
import { PH_REGION_TO_PROVINCES } from '../../data/ph/region-provinces.js'
import { PH_PROVINCE_TO_REGION } from '../../data/ph/province-region.js'

const violationStatusOptions = [
  { value: 'Paid', label: 'Paid' },
  { value: 'Unpaid', label: 'Unpaid' },
  { value: 'Contested', label: 'Contested' },
]

const violationTypeOptions = [
  { value: 'Beating the Red Light', label: 'Beating the Red Light' },
  { value: 'Speeding', label: 'Speeding' },
  { value: 'Illegal U-Turn', label: 'Illegal U-Turn' },
  { value: 'Tailgating', label: 'Tailgating' },
  { value: 'No helmet', label: 'No helmet' },
  { value: 'Disregarding traffic signs', label: 'Disregarding traffic signs' }
]

function normalizePlateInput(value) {
  const raw = String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7)

  if (raw.length <= 3) return raw
  return `${raw.slice(0, 3)}-${raw.slice(3)}`
}

export default function ViolationForm({
  initialValues,
  onSubmit,
  onCancel,
  saving,
  submitLabel = 'Save Violation',
}) {

  
// Violation type text entry OR dropdown
// Violation date (calendar)
// Violation fine amount
// Apprehending officer text input
// Violation status dropdown
// Address 

// search for license
// Search for plate number

  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])

  const [plateNumber, setPlateNumber] = useState(() => initialValues?.vehicle?.plate_number ?? '')
  const [licenseNumber, setLicenseNumber] = useState(() => initialValues?.driver?.license_number ?? '')

  const [violationType, setViolationType] = useState(() => initialValues?.violation_type ?? '')
  const [violationDate, setViolationDate] = useState(() => initialValues?.violation_date ?? '')
  const [violationFine, setViolationFine] = useState(() => initialValues?.violation_fine ?? '')
  const [apprehendingOfficer, setApprehendingOfficer] = useState(() => initialValues?.apprehending_officer ?? '')
  const [violationStatus, setViolationStatus] = useState(() => initialValues?.violation_status ?? '')

  const [street, setStreet] = useState(() => initialValues?.location?.street ?? '')
  const [city, setCity] = useState(() => initialValues?.location?.city ?? '')
  const [province, setProvince] = useState(() => initialValues?.location?.province ?? '')
  const [region, setRegion] = useState(() => initialValues?.location?.region ?? '')

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      try {
        const [driverData, vehicleData] = await Promise.all([
          listDrivers(),
          listVehicles()
        ])
        if (!cancelled) {
          setDrivers(driverData)
          setVehicles(vehicleData)
        }
      } catch (err) {
        console.error("Failed to load form data", err)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [])

  const regionOptions = useMemo(
    () => PH_REGIONS.map((r) => ({ value: r, label: r })),
    [],
  )

  const provinceOptions = useMemo(
    () => {
      if (!region) return []
      const provinces = PH_REGION_TO_PROVINCES[region] ?? []
      return provinces.map((p) => ({ value: p, label: p }))
    },
    [region],
  )

  const cityOptions = useMemo(() => {
    if (!province) return []
    return PH_CITIES_MUNICIPALITIES
      .filter((c) => c.province === province)
      .map((c) => ({ value: c.name, label: c.name }))
  }, [province])


  // Map Drivers for Combobox
  const driverOptions = useMemo(() => {
    return (drivers ?? []).map((d) => ({
      value: d.license_number,
      label: d.full_name,
      description: `License: ${formatLicenseNumber(d.license_number)}`,
    }))
  }, [drivers])

  // Map Vehicles for Combobox
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
      license_number: licenseNumber,
      plate_number: plateNumber,
      violation_type: violationType,
      violation_date: violationDate,
      violation_fine: Number(violationFine),
      apprehending_officer: apprehendingOfficer,
      violation_status: violationStatus,
      location: { street, city, province, region }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <SectionCard title="Driver & Vehicle" icon={<User className="size-4" />} accent="green">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1">

        <FormField label="Search Driver" required>
          <Combobox
            leftIcon={<Search className="size-5" />}
            value={licenseNumber}
            onChange={(v) => setLicenseNumber(v)}
            options={driverOptions}
            placeholder="Search by name or license number..."
            searchPlaceholder="Search by name or license number..."
          />
        </FormField>

          <FormField label="Search Vehicle" required>
              <Combobox
                leftIcon={<Search className="size-5" />}
                value={plateNumber}
                onChange={(v) => setPlateNumber(v)}
                options={vehicleOptions}
                placeholder="Search by vehicle or plate number..."
                searchPlaceholder="Search by vehicle or plate number..."
              />
          </FormField>


        </div>

      </SectionCard>


      <SectionCard title="Address Information" icon={<MapPin className="size-4" />} accent="green">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FormField label="Street Address" required>
                <TextInput
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street address"
                  maxLength={120}
                />
              </FormField>
            </div>
            <FormField label="Region" required>
              <Combobox
                value={region}
                onChange={(v) => { setRegion(v); setProvince(''); setCity(''); }}
                options={regionOptions}
                placeholder="Select a region..."
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Province" required>
              <Combobox
                value={province}
                onChange={(v) => { setProvince(v); setCity(''); }}
                options={provinceOptions}
                disabled={!region}
                placeholder={region ? 'Select a province...' : 'Select a region first...'}
                emptyText={region ? 'No matching province' : 'Select a region first'}
              />
            </FormField>
            <FormField label="City/Municipality" required>
              <Combobox
                value={city}
                onChange={setCity}
                options={cityOptions}
                placeholder={province ? 'Select a city/municipality...' : 'Select a province first...'}
                disabled={!province}
                emptyText={province ? 'No matching city/municipality' : 'Select a province first'}
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Violation Information" icon={<TriangleAlert className="size-4" />} accent="green">
        <div className="md:col-span-2">

          <FormField label="Violation Type" required>
            <TextInput
              list="violation_type_suggestions"
              leftIcon={<TriangleAlert className="size-5" />}
              value={violationType}
              onChange={(e) => setViolationType(e.target.value)}
              placeholder="e.g. Beating the Red Light"
              maxLength={255}
              autoComplete="off"
            />
            <datalist id="violation_type_suggestions">
              {violationTypeOptions.map((o) => (
                <option key={o.value} value={o.value} />
              ))}
            </datalist>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">

          <FormField label="Violation Fine Amount" required>
              <TextInput
                leftIcon={<PhilippinePeso className="size-5" />}
                value={violationFine}
                onChange={(e) => setViolationFine(e.target.value)}
              />
          </FormField>

          <FormField label="Violation Status" required>
              <SelectInput
                value={violationStatus}
                onChange={(e) => setViolationStatus(e.target.value)}
                aria-label="Violation status"
              >
                {violationStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </SelectInput>
          </FormField>


            <FormField label="Violation Date" required>
              <TextInput
                leftIcon={<Calendar className="size-5" />}
                type="date"
                value={violationDate}
                onChange={(e) => setViolationDate(e.target.value)}
              />
            </FormField>

            <FormField label="Apprehending Officer">
              <TextInput
                leftIcon={<ShieldCheck className="size-5" />}
                value={apprehendingOfficer}
                onChange={(e) => setApprehendingOfficer(e.target.value)}
              />
            </FormField>




        </div>
      </SectionCard>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant="green" type="submit" disabled={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
