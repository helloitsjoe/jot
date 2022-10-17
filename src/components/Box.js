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
  ${({ gap }) => (gap ? `gap: ${gap}` : '')}
  ${({ transform }) => (transform ? `transform: ${transform}` : '')}
`;

export default Box;
