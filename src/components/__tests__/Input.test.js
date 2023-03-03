import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Input from '../Input';

describe('Input', () => {
  it('shows custom validity message', () => {
    render(
      <form>
        <label>
          Input
          <Input pattern="[a-zA-Z0-9]" invalidMessage="No sir." />
        </label>
        <button type="submit">Submit</button>
      </form>
    );

    fireEvent.change(screen.getByLabelText('Input'), {
      target: { value: 'a' },
    });
    fireEvent.submit(screen.getByRole('button'));
    expect(screen.queryByText('No sir.')).toBeTruthy();
  });
});
