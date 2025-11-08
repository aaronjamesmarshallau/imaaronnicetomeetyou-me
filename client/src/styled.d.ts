import 'styled-components';
import { CustomTheme } from './App';

declare module 'styled-components' {
  export interface DefaultTheme extends CustomTheme {}
}