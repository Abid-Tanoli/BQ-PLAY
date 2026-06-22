import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import Teams from '../pages/Teams'

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
}))

describe('Teams', () => {
  it('renders loading state initially', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Teams />
        </MemoryRouter>
      </ThemeProvider>
    )
    expect(screen.getByText('Loading Teams...')).toBeInTheDocument()
  })
})
