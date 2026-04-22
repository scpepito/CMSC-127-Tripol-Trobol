export function listRowFromApi(vehicle) {
  return {
    id: vehicle.plate_number,
    plateNumber: vehicle.plate_number,
    vehicleName: `${vehicle.make} ${vehicle.model}`.trim(),
    vehicleSub: `${vehicle.year} • ${vehicle.color}`,
    type: vehicle.vehicle_type,
    ownerName: vehicle.owner?.full_name ?? '',
    ownerLicenseNumber: vehicle.owner?.license_number ?? '',
    _raw: vehicle,
  }
}
