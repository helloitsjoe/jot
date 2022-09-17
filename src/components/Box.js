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
  ${({ gap }) => (gap ? `gap: ${gap}` : '')}
`;

export default Box;
