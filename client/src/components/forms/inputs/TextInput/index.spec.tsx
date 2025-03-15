import { render, RenderResult } from '@testing-library/react'
import { TextInput } from '.'
import { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

const darkTheme = {
  background: {
    primary: '#1F1B2D',
    secondary: '#201D28',
  },
  foreground: {
    primary: '#F4F3F6',
    secondary: '#D0C8CE',
  },
  highlight: {
    primary: '#EF2655',
    secondary: '#8E254A',
    tertiary: '#63254D',
  },
};

const renderWithTheme = (el: ReactElement): RenderResult => {
  return render(
    <ThemeProvider theme={darkTheme}>
      {el}
    </ThemeProvider>
  )
}

describe("TextInput", () => {
  it("renders", () => {
    const result = renderWithTheme(<TextInput placeholder='example'/>);

    expect(true).toBeTruthy();
  })
})