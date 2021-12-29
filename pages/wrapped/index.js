import { Grommet } from 'grommet'
import { Parallax, ParallaxProvider } from 'react-scroll-parallax'

export default function Wrapped () {
  return (
    <Grommet>
      <ParallaxProvider>
        Hello
        <Parallax>Hello2</Parallax>
      </ParallaxProvider>
    </Grommet>
  )
}
