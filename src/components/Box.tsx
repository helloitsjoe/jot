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

// Ignoring specific props because of this issue:
// https://github.com/styled-system/styled-system/issues/1044#issuecomment-1104748647
const Box = styled('div').withConfig({
  shouldForwardProp: (prop) =>
    ![
      'alignSelf',
      'alignItems',
      'flexDirection',
      'flexWrap',
      'justifyContent',
      'borderBottom',
      'borderRadius',
      'lineHeight',
      'maxWidth',
    ].includes(prop),
})`
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
