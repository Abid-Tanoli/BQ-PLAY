import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WagonWheel from '../components/WagonWheel'

describe('WagonWheel', () => {
  it('renders title and empty state stats', () => {
    render(<WagonWheel shots={[]} playerName="Player A" />)
    expect(screen.getByText(/Wagon Wheel/i)).toBeInTheDocument()
    expect(screen.getByText(/Player A/i)).toBeInTheDocument()
    expect(screen.getByText('RUNS').parentElement.textContent).toContain('0')
  })

  it('correctly compiles stats for boundary and non-boundary runs', () => {
    const shots = [
      { runs: 4, angle: 45, distance: 90 }, // Off side 4
      { runs: 6, angle: -30, distance: 90 }, // Leg side 6
      { runs: 1, angle: 10, distance: 30 },  // Off side 1
      { runs: 2, angle: -10, distance: 40 }, // Leg side 2
      { runs: 0, angle: 0, distance: 0 },    // Dot ball (should not compile runs)
    ]

    render(<WagonWheel shots={shots} playerName="Batsman X" />)

    // Total runs = 4 + 6 + 1 + 2 = 13
    expect(screen.getByText('13')).toBeInTheDocument()

    // Since multiple elements contain "1" (Sixes count, Fours count, "Singles/Others" is not 1 but singles runs might contain it, etc.),
    // we verify the category labels exist and check the unique run aggregates.
    expect(screen.getByText('Sixes')).toBeInTheDocument()
    expect(screen.getByText('Fours')).toBeInTheDocument()
    expect(screen.getByText('Singles/Others')).toBeInTheDocument()
    
    // Off side runs = 4 (four) + 1 (single) = 5 runs
    // Leg side runs = 6 (six) + 2 (double) = 8 runs
    expect(screen.getByText('5')).toBeInTheDocument() // Off side runs
    expect(screen.getByText('8')).toBeInTheDocument() // Leg side runs
  })
})
