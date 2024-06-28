/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from 'styled-components';
import {
  color,
  space,
  layout,
  border,
  flexbox,
  typography,
  position,
  shadow,
} from 'styled-system';

const Box = styled.div`
  ${color}
  ${space}
  ${layout}
  ${border}
  ${flexbox}
  ${typography}
  ${position}
  ${shadow}
  // TODO: Generalize this?
  ${({ gap }: any) => (gap ? `gap: ${gap}` : '')}
  ${({ transform }: any) => (transform ? `transform: ${transform}` : '')}
`;

export default Box;
