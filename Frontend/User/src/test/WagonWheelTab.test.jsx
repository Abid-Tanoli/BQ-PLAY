import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WagonWheelTab from '../components/WagonWheelTab'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

vi.mock('../services/socket', () => ({
  initSocket: vi.fn().mockReturnValue({
    on: vi.fn(),
    off: vi.fn(),
  }),
  joinMatchRoom: vi.fn(),
  leaveMatchRoom: vi.fn(),
}))

describe('WagonWheelTab', () => {
  const mockMatch = {
    _id: 'match-123',
    currentInnings: 0,
    innings: [
      {
        batting: [
          { player: { _id: 'batsman-1', name: 'Batsman One' } },
          { player: { _id: 'batsman-2', name: 'Batsman Two' } },
        ],
      },
    ],
  }

  const mockPlayers = [
    { _id: 'batsman-1', name: 'Batsman One' },
    { _id: 'batsman-2', name: 'Batsman Two' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially and then displays the selector and wagon wheel', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

    render(<WagonWheelTab match={mockMatch} players={mockPlayers} />)

    expect(screen.getByText(/Loading wagon wheel/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByLabelText(/Filter by Batsman/i)).toBeInTheDocument()
    })

    expect(screen.getByText('All Batsmen')).toBeInTheDocument()
    expect(screen.getByText('Batsman One')).toBeInTheDocument()
    expect(screen.getByText('Batsman Two')).toBeInTheDocument()
  })

  it('triggers a new API request when changing the batsman filter', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    render(<WagonWheelTab match={mockMatch} players={mockPlayers} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/Filter by Batsman/i)).toBeInTheDocument()
    })

    const select = screen.getByLabelText(/Filter by Batsman/i)
    fireEvent.change(select, { target: { value: 'batsman-1' } })

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/matches/match-123/wagon-wheel/1/batsman-1')
    })
  })
})
