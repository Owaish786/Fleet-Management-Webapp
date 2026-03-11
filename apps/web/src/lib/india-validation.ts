export const indianPlatePattern = '^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$'
export const indianLicensePattern = '^[A-Z]{2}-?[0-9]{6,14}$'
export const indianPhonePattern = '^(\\+91\\s?)?[6-9][0-9]{4}\\s?[0-9]{5}$'

export function normalizePlateInput(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function normalizeLicenseInput(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
}
