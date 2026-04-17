import { useMemo, useState } from 'react'
import { Calendar, MapPin, ShieldCheck, User } from 'lucide-react'
import {
  Button,
  Combobox,
  FormField,
  SectionCard,
  SelectInput,
  TextInput,
} from '../../components/index.js'
import { PH_CITIES_MUNICIPALITIES } from '../../data/ph/cities-municipalities.js'
import { PH_REGIONS } from '../../data/ph/regions.js'
import { PH_REGION_TO_PROVINCES } from '../../data/ph/region-provinces.js'
import { PH_PROVINCE_TO_REGION } from '../../data/ph/province-region.js'
import { formatLicenseNumber, toLicenseRaw } from '../../lib/licenseNumber.js'

const licenseTypeOptions = [
  { value: 'Student Permit', label: 'Student Permit' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Non-Professional', label: 'Non-Professional' },
]

const licenseStatusOptions = [
  { value: 'Valid', label: 'Valid' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Revoked', label: 'Revoked' },
]

function isoToday() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function DriverForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
  submitLabel,
  busy,
  error,
}) {
  const defaults = useMemo(
    () => {
      const merged = {
        license_number: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        sex: 'M',
        street: '',
        city: '',
        region: '',
        province: '',
        postal_code: '',
        license_type: 'Professional',
        license_status: 'Valid',
        issuance_date: isoToday(),
        expiration_date: isoToday(),
        ...(initialValues ?? {}),
      }

      if (!merged.region && merged.province) {
        merged.region = PH_PROVINCE_TO_REGION[merged.province] ?? ''
      }

      return merged
    },
    [initialValues],
  )

  const [values, setValues] = useState(defaults)

  function setField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit?.({
      ...values,
      license_number: toLicenseRaw(values.license_number),
    })
  }

  const regionOptions = useMemo(
    () => PH_REGIONS.map((r) => ({ value: r, label: r })),
    [],
  )

  const provinceOptions = useMemo(
    () => {
      if (!values.region) return []
      const provinces = PH_REGION_TO_PROVINCES[values.region] ?? []
      return provinces.map((p) => ({ value: p, label: p }))
    },
    [values.region],
  )

  const cityOptions = useMemo(() => {
    if (!values.province) return []
    return PH_CITIES_MUNICIPALITIES
      .filter((c) => c.province === values.province)
      .map((c) => ({ value: c.name, label: c.name }))
  }, [values.province])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Personal Information" icon={<User className="size-4" />}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="First Name" required>
              <TextInput
                value={values.first_name}
                onChange={(e) => setField('first_name', e.target.value)}
                placeholder="First name"
                maxLength={64}
              />
            </FormField>
            <FormField label="Middle Name">
              <TextInput
                value={values.middle_name}
                onChange={(e) => setField('middle_name', e.target.value)}
                placeholder="Middle name"
                maxLength={64}
              />
            </FormField>
            <FormField label="Last Name" required>
              <TextInput
                value={values.last_name}
                onChange={(e) => setField('last_name', e.target.value)}
                placeholder="Last name"
                maxLength={64}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date of Birth" required>
              <TextInput
                leftIcon={<Calendar className="size-5" />}
                type="date"
                value={values.date_of_birth}
                onChange={(e) => setField('date_of_birth', e.target.value)}
              />
            </FormField>
            <FormField label="Sex" required>
              <SelectInput
                value={values.sex}
                onChange={(e) => setField('sex', e.target.value)}
                aria-label="Sex"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </SelectInput>
            </FormField>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Address Information" icon={<MapPin className="size-4" />}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FormField label="Street Address" required>
                <TextInput
                  value={values.street}
                  onChange={(e) => setField('street', e.target.value)}
                  placeholder="Street address"
                  maxLength={120}
                />
              </FormField>
            </div>
            <FormField label="Region" required>
              <Combobox
                value={values.region}
                onChange={(v) => {
                  setField('region', v)
                  setField('province', '')
                  setField('city', '')
                }}
                options={regionOptions}
                placeholder="Select a region..."
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Province" required>
              <Combobox
                value={values.province}
                onChange={(v) => {
                  setField('province', v)
                  setField('city', '')
                }}
                options={provinceOptions}
                disabled={!values.region}
                placeholder={values.region ? 'Select a province...' : 'Select a region first...'}
                emptyText={values.region ? 'No matching province' : 'Select a region first'}
              />
            </FormField>
            <FormField label="City/Municipality" required>
              <Combobox
                value={values.city}
                onChange={(v) => setField('city', v)}
                options={cityOptions}
                placeholder={values.province ? 'Select a city/municipality...' : 'Select a province first...'}
                disabled={!values.province}
                emptyText={values.province ? 'No matching city/municipality' : 'Select a province first'}
              />
            </FormField>
            <FormField label="Postal Code">
              <TextInput
                value={values.postal_code}
                onChange={(e) => setField('postal_code', e.target.value)}
                placeholder="Postal code"
                maxLength={20}
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="License Information" icon={<ShieldCheck className="size-4" />}>
        <div className="md:col-span-2">
          <FormField
            label="License Number"
            required={mode === 'create'}
            hint={mode === 'edit' ? 'License number cannot be changed.' : undefined}
          >
            <TextInput
              value={formatLicenseNumber(values.license_number)}
              onChange={(e) => setField('license_number', toLicenseRaw(e.target.value))}
              placeholder="e.g., D01-23-456789"
              maxLength={13}
              disabled={mode === 'edit'}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
          <FormField label="License Type" required>
            <SelectInput
              value={values.license_type}
              onChange={(e) => setField('license_type', e.target.value)}
              aria-label="License type"
            >
              {licenseTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="License Status" required>
            <SelectInput
              value={values.license_status}
              onChange={(e) => setField('license_status', e.target.value)}
              aria-label="License status"
            >
              {licenseStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Issuance Date" required>
            <TextInput
              leftIcon={<Calendar className="size-5" />}
              type="date"
              value={values.issuance_date}
              onChange={(e) => setField('issuance_date', e.target.value)}
            />
          </FormField>

          <FormField label="Expiration Date" required>
            <TextInput
              leftIcon={<Calendar className="size-5" />}
              type="date"
              value={values.expiration_date}
              onChange={(e) => setField('expiration_date', e.target.value)}
            />
          </FormField>
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
