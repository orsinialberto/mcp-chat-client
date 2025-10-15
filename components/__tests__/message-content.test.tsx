import { render, screen } from '@testing-library/react'
import { MessageContent } from '../message-content'

jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>
  }
})

jest.mock('remark-gfm', () => {
  return {}
})

jest.mock('../chart-renderer', () => {
  return {
    ChartRenderer: ({ chartData }: any) => (
      <div data-testid="chart-renderer">Chart: {chartData.type}</div>
    )
  }
})

describe('MessageContent', () => {
  describe('Content Rendering', () => {
    it('should render content successfully', () => {
      const content = 'Test content'
      render(<MessageContent content={content} />)
      expect(screen.getByText(/Test content/i)).toBeInTheDocument()
    })

    it('should use markdown renderer for text content', () => {
      const content = 'Markdown text'
      render(<MessageContent content={content} />)
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    })
  })

  describe('Content Cleaning', () => {
    it('should remove surrounding quotes', () => {
      const content = '"Quoted text"'
      render(<MessageContent content={content} />)
      expect(screen.getByText('Quoted text')).toBeInTheDocument()
    })

    it('should handle content without quotes', () => {
      const content = 'Normal text'
      render(<MessageContent content={content} />)
      expect(screen.getByText(/Normal text/i)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const { container } = render(<MessageContent content="" />)
      expect(container.querySelector('.prose')).toBeInTheDocument()
    })

    it('should handle very long content without crashing', () => {
      const longContent = 'A'.repeat(10000)
      expect(() => {
        render(<MessageContent content={longContent} />)
      }).not.toThrow()
    })

    it('should handle special characters', () => {
      const content = 'Special chars: <>&"\'`~!@#$%^&*()'
      render(<MessageContent content={content} />)
      expect(screen.getByText(/Special chars/i)).toBeInTheDocument()
    })

    it('should render component without errors', () => {
      const content = 'Simple test'
      const { container } = render(<MessageContent content={content} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})

