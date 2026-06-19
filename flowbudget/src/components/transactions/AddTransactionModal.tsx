import { useEffect, useMemo, useState } from 'react'
import type { Category } from '../../types'
import { EXPENSE_CATEGORIES } from '../../lib/categories'
import { todayISO } from '../../lib/date'
import { useData } from '../../context/DataContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

type Kind = 'expense' | 'income'

interface FormState {
  kind: Kind
  amount: string
  date: string
  category: Category
  note: string
}

const blank = (): FormState => ({
  kind: 'expense',
  amount: '',
  date: todayISO(),
  category: 'Groceries',
  note: '',
})

type Errors = Partial<Record<'amount' | 'date' | 'note', string>>

function validate(f: FormState): Errors {
  const errors: Errors = {}
  const amount = Number(f.amount)
  if (!f.amount.trim()) errors.amount = 'Enter an amount.'
  else if (Number.isNaN(amount)) errors.amount = 'Amount must be a number.'
  else if (amount <= 0) errors.amount = 'Amount must be greater than zero.'
  else if (amount > 1_000_000) errors.amount = 'That amount looks too large.'

  if (!f.date) errors.date = 'Pick a date.'
  else if (f.date > todayISO()) errors.date = 'Date can’t be in the future.'

  if (!f.note.trim()) errors.note = 'Add a short description.'
  else if (f.note.trim().length < 2) errors.note = 'Description is too short.'

  return errors
}

export function AddTransactionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTransaction } = useData()
  const [form, setForm] = useState<FormState>(blank)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(blank())
      setTouched(false)
    }
  }, [open])

  const errors = useMemo(() => validate(form), [form])
  const isValid = Object.keys(errors).length === 0

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setKind = (kind: Kind) =>
    setForm((f) => ({
      ...f,
      kind,
      category: kind === 'income' ? 'Income' : f.category === 'Income' ? 'Groceries' : f.category,
    }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    const magnitude = Number(form.amount)
    addTransaction({
      date: form.date,
      amount: form.kind === 'income' ? magnitude : -magnitude,
      category: form.category,
      note: form.note.trim(),
    })
    onClose()
  }

  const showError = (field: keyof Errors) => touched && errors[field]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add transaction"
      description="Record income or an expense. It updates every chart instantly."
    >
      <form onSubmit={submit} noValidate className="space-y-5 px-6 pb-6 pt-5">
        {/* Type toggle */}
        <div
          className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1"
          role="radiogroup"
          aria-label="Transaction type"
        >
          {(['expense', 'income'] as Kind[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={form.kind === k}
              onClick={() => setKind(k)}
              className={`rounded-lg py-2 text-sm font-semibold capitalize transition-all ${
                form.kind === k
                  ? k === 'income'
                    ? 'bg-surface text-positive shadow-sm'
                    : 'bg-surface text-content shadow-sm'
                  : 'text-muted hover:text-content'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Amount + Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Amount" htmlFor="amount" error={showError('amount')}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                $
              </span>
              <input
                id="amount"
                inputMode="decimal"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value.replace(/[^0-9.]/g, ''))}
                aria-invalid={!!showError('amount')}
                aria-describedby={showError('amount') ? 'amount-error' : undefined}
                className={inputClass(!!showError('amount'), 'pl-7 tnum')}
              />
            </div>
          </Field>

          <Field label="Date" htmlFor="date" error={showError('date')}>
            <input
              id="date"
              type="date"
              max={todayISO()}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              aria-invalid={!!showError('date')}
              aria-describedby={showError('date') ? 'date-error' : undefined}
              className={inputClass(!!showError('date'))}
            />
          </Field>
        </div>

        {/* Category */}
        <Field label="Category" htmlFor="category">
          {form.kind === 'income' ? (
            <input
              id="category"
              value="Income"
              disabled
              className={`${inputClass(false)} cursor-not-allowed opacity-70`}
            />
          ) : (
            <select
              id="category"
              value={form.category}
              onChange={(e) => set('category', e.target.value as Category)}
              className={inputClass(false)}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* Note */}
        <Field label="Description" htmlFor="note" error={showError('note')}>
          <input
            id="note"
            placeholder="e.g. Weekly groceries"
            value={form.note}
            maxLength={60}
            onChange={(e) => set('note', e.target.value)}
            aria-invalid={!!showError('note')}
            aria-describedby={showError('note') ? 'note-error' : undefined}
            className={inputClass(!!showError('note'))}
          />
        </Field>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={touched && !isValid}>
            Save transaction
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function inputClass(invalid: boolean, extra = '') {
  return `w-full h-10 rounded-lg border bg-surface px-3 text-sm text-content placeholder:text-subtle outline-none transition-colors ${
    invalid
      ? 'border-negative focus:border-negative'
      : 'border-border-strong focus:border-brand'
  } ${extra}`
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string | false
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-content">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 text-[12px] font-medium text-negative">
          {error}
        </p>
      )}
    </div>
  )
}
