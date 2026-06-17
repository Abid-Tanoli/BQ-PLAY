import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsTab from '../components/ScoreManagement/StatsTab'

describe('StatsTab', () => {
  it('renders empty state when no innings', () => {
    render(<StatsTab />)
    expect(screen.getByText('No innings data yet')).toBeInTheDocument()
  })

  it('renders stats grid with innings data', () => {
    const innings = {
      runs: 45, wickets: 2, balls: 30, runRate: 9.0,
      extras: { total: 3, wides: 1, noBalls: 0, byes: 1, legByes: 1, penalties: 0 },
      batting: [
        { player: { name: 'Batter A' }, runs: 24, balls: 15, fours: 3, sixes: 1 },
        { player: { name: 'Batter B' }, runs: 12, balls: 10, fours: 1, sixes: 0 },
      ],
      bowling: [
        { player: { name: 'Bowler X' }, wickets: 1, runs: 18, balls: 18 },
      ],
      oversHistory: [
        { balls: [{ runs: 4 }, { runs: 0, isWicket: false }, { runs: 1 }] },
      ],
    }
    render(<StatsTab innings={innings} totalOvers={20} />)
    expect(screen.getByText('Live Match Statistics')).toBeInTheDocument()
    expect(screen.getByText('9.00')).toBeInTheDocument()
    expect(screen.getByText('Batter A')).toBeInTheDocument()
    expect(screen.getByText('Bowler X')).toBeInTheDocument()
  })

  it('renders current striker and non-striker stats', () => {
    const innings = {
      runs: 30, wickets: 1, balls: 24, runRate: 7.5,
      extras: { total: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0 },
      batting: [], bowling: [], oversHistory: [],
    }
    const strikerStats = { player: { name: 'Striker S' }, runs: 18, balls: 12, fours: 2, sixes: 1 }
    const nonStrikerStats = { player: { name: 'NonStriker N' }, runs: 6, balls: 8, fours: 0, sixes: 0 }
    render(<StatsTab innings={innings} strikerStats={strikerStats} nonStrikerStats={nonStrikerStats} />)
    expect(screen.getByText(/Striker S/)).toBeInTheDocument()
    expect(screen.getByText(/NonStriker N/)).toBeInTheDocument()
  })
})
