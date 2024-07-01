import * as React from 'react';
import Box from './Box';

export interface TagType {
  id: number;
  text: string;
  color: string;
}

export default function Tag({
  id,
  color,
  children,
  onSelect = () => {},
  // onEdit,
  onDelete,
}: {
  id: number;
  color: string;
  children: string;
  onSelect: ({ text, color, id }: { text; color; id }) => void;
  onDelete?: (e: Event) => void;
}) {
  return (
    <Box
      as="span"
      border={`2px solid ${color}`}
      color={color}
      p="0.2em 0.4em"
      display="inline-block"
      borderRadius="0.4em"
      onClick={() => onSelect({ text: children, color, id })}
    >
      <span>{children}</span>
      {onDelete && (
        <Box
          as="button"
          ml="0.5em"
          type="button"
          onClick={onDelete}
          bg="transparent"
          border="none"
          color="gray"
          data-testid={`tag-${id}-delete`}
        >
          X
        </Box>
      )}
    </Box>
  );
}
