import { describe, test, expect } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InteractiveTimeSeriesChart } from './InteractiveTimeSeriesChart'

const mockSeries = [
  {
    id: 'a',
    label: 'Série A',
    unit: '%',
    source: 'Fonte A',
    timeSeries: [
      { year: 2020, value: 10 },
      { year: 2021, value: 20 },
    ],
    color: '#157244',
    chartType: 'line' as const,
  },
  {
    id: 'b',
    label: 'Série B',
    unit: 'pts',
    source: 'Fonte B',
    timeSeries: [
      { year: 2020, value: 5 },
      { year: 2021, value: 15 },
    ],
    color: '#C7392F',
    chartType: 'line' as const,
  },
]

describe('InteractiveTimeSeriesChart', () => {
  test('renders with default selected series', () => {
    render(<InteractiveTimeSeriesChart series={mockSeries} />)
    const trigger = screen.getByRole('button', { expanded: false })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Série A')
  })

  test('opens dropdown when trigger is clicked', async () => {
    render(<InteractiveTimeSeriesChart series={mockSeries} />)
    const trigger = screen.getByRole('button', { expanded: false })
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  test('closes dropdown when trigger is clicked again', async () => {
    render(<InteractiveTimeSeriesChart series={mockSeries} />)
    const trigger = screen.getByRole('button', { expanded: false })
    await userEvent.click(trigger)
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('selects a different item and updates the trigger', async () => {
    render(<InteractiveTimeSeriesChart series={mockSeries} />)
    const trigger = screen.getByRole('button', { expanded: false })
    await userEvent.click(trigger)

    const listbox = screen.getByRole('listbox')
    const optionB = within(listbox).getByRole('option', { name: /Série B/ })
    await userEvent.click(optionB)

    await waitFor(() => {
      expect(trigger).toHaveTextContent('Série B')
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('click outside closes the dropdown', async () => {
    render(<InteractiveTimeSeriesChart series={mockSeries} />)
    const trigger = screen.getByRole('button', { expanded: false })
    await userEvent.click(trigger)
    await userEvent.click(document.body)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('Escape closes the dropdown', async () => {
    render(<InteractiveTimeSeriesChart series={mockSeries} />)
    const trigger = screen.getByRole('button', { expanded: false })
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('keyboard navigation with ArrowDown selects next option', async () => {
    render(<InteractiveTimeSeriesChart series={mockSeries} />)
    const trigger = screen.getByRole('button', { expanded: false })
    await userEvent.click(trigger)

    // Press ArrowDown to navigate to next option
    await userEvent.keyboard('{ArrowDown}')

    // The focused option should be highlighted (bg-areia-50)
    const listbox = screen.getByRole('listbox')
    const options = within(listbox).getAllByRole('option')

    // After ArrowDown, second option should have focused styling
    expect(options[1]).toHaveClass('bg-areia-50')
  })

  test('keyboard selection with Enter updates the chart', async () => {
    render(<InteractiveTimeSeriesChart series={mockSeries} />)
    const trigger = screen.getByRole('button', { expanded: false })
    await userEvent.click(trigger)

    // Navigate to second option with ArrowDown
    await userEvent.keyboard('{ArrowDown}')
    // Select with Enter
    await userEvent.keyboard('{Enter}')

    await waitFor(() => {
      expect(trigger).toHaveTextContent('Série B')
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('keyboard selection with Space updates the chart', async () => {
    render(<InteractiveTimeSeriesChart series={mockSeries} />)
    const trigger = screen.getByRole('button', { expanded: false })
    await userEvent.click(trigger)

    // Navigate to second option
    await userEvent.keyboard('{ArrowDown}')
    // Select with Space
    await userEvent.keyboard(' ')

    await waitFor(() => {
      expect(trigger).toHaveTextContent('Série B')
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
