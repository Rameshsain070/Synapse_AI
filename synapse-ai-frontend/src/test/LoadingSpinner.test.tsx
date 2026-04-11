import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('applies size classes correctly', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
