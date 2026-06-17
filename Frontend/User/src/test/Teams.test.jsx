import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Teams from '../pages/Teams'

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
}))

describe('Teams', () => {
  it('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    )
    expect(screen.getByText('Loading Teams...')).toBeInTheDocument()
  })
})
