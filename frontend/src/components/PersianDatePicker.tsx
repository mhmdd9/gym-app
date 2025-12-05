import DatePicker, { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import gregorian from 'react-date-object/calendars/gregorian'
import persian_fa from 'react-date-object/locales/persian_fa'
import gregorian_en from 'react-date-object/locales/gregorian_en'

interface PersianDatePickerProps {
  value: string // Gregorian date string: YYYY-MM-DD
  onChange: (gregorianDate: string) => void
  minDate?: string // Gregorian date string: YYYY-MM-DD
  maxDate?: string // Gregorian date string: YYYY-MM-DD
  placeholder?: string
  className?: string
  disabled?: boolean
}

/**
 * Persian (Jalali) Date Picker component.
 * - Displays dates in Persian calendar (شمسی)
 * - Accepts and returns Gregorian dates (میلادی) for API compatibility
 */
export default function PersianDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'انتخاب تاریخ',
  className = '',
  disabled = false,
}: PersianDatePickerProps) {
  // Convert Gregorian string to Persian DateObject for display
  // First create a Gregorian DateObject, then convert to Persian
  const dateValue = value 
    ? new DateObject({ date: value, calendar: gregorian, locale: gregorian_en })
        .convert(persian, persian_fa)
    : null

  // Convert min/max dates from Gregorian to Persian
  const minDateObj = minDate 
    ? new DateObject({ date: minDate, calendar: gregorian, locale: gregorian_en })
        .convert(persian, persian_fa)
    : undefined
  const maxDateObj = maxDate 
    ? new DateObject({ date: maxDate, calendar: gregorian, locale: gregorian_en })
        .convert(persian, persian_fa)
    : undefined

  const handleChange = (date: DateObject | null) => {
    if (date) {
      // Convert Persian date back to Gregorian for API
      const gregorianDate = date.convert(gregorian, gregorian_en)
      const year = gregorianDate.year
      const month = String(gregorianDate.month.number).padStart(2, '0')
      const day = String(gregorianDate.day).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    } else {
      onChange('')
    }
  }

  return (
    <DatePicker
      value={dateValue}
      onChange={handleChange}
      calendar={persian}
      locale={persian_fa}
      minDate={minDateObj}
      maxDate={maxDateObj}
      placeholder={placeholder}
      disabled={disabled}
      calendarPosition="bottom-right"
      containerClassName="w-full"
      inputClass={`input-field w-full ${className}`}
      className="persian-datepicker"
      weekDays={['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']}
      format="YYYY/MM/DD"
      arrow={false}
    />
  )
}
