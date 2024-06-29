import { afterEach, it, describe, expect, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Tag from '../components/Tag';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Tag', () => {
  it('onSelect is called when text is pressed', () => {
    const onSelect = vi.fn();
    render(<Tag onSelect={onSelect}>Foo</Tag>);
    expect(onSelect).toBeCalledTimes(0);
    fireEvent.click(screen.queryByText('Foo'));
    expect(onSelect).toBeCalledTimes(1);
  });

  it('onDelete is called when X is pressed', () => {
    const onDelete = vi.fn();
    render(<Tag onDelete={onDelete}>Foo</Tag>);
    expect(onDelete).toBeCalledTimes(0);
    fireEvent.click(screen.queryByText('X'));
    expect(onDelete).toBeCalledTimes(1);
  });

  it('X is hidden if onDelete is absent', () => {
    render(<Tag>Foo</Tag>);
    expect(screen.queryByText('X')).not.toBeTruthy();
  });
});
