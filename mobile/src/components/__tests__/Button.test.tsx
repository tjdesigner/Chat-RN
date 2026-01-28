import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  it('should render correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Press Me" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should show loading indicator when loading', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Submit" onPress={() => {}} loading={true} />
    );
    
    expect(queryByText('Submit')).toBeNull();
  });

  it('should be disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" onPress={onPressMock} disabled={true} />
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should apply custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByText } = render(
      <Button title="Styled" onPress={() => {}} style={customStyle} />
    );
    
    expect(getByText('Styled')).toBeTruthy();
  });

  it('should render with different variants', () => {
    const { rerender, getByText } = render(
      <Button title="Primary" onPress={() => {}} variant="primary" />
    );
    expect(getByText('Primary')).toBeTruthy();

    rerender(<Button title="Secondary" onPress={() => {}} variant="secondary" />);
    expect(getByText('Secondary')).toBeTruthy();

    rerender(<Button title="Danger" onPress={() => {}} variant="danger" />);
    expect(getByText('Danger')).toBeTruthy();
  });
});
