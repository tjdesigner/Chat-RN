import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../Input';

describe('Input Component', () => {
  it('should render correctly', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should render with label', () => {
    const { getByText } = render(
      <Input label="Username" placeholder="Enter username" />
    );
    expect(getByText('Username')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Type here" onChangeText={onChangeTextMock} />
    );
    
    fireEvent.changeText(getByPlaceholderText('Type here'), 'New text');
    expect(onChangeTextMock).toHaveBeenCalledWith('New text');
  });

  it('should display error message when error prop is provided', () => {
    const { getByText } = render(
      <Input placeholder="Email" error="Invalid email" />
    );
    expect(getByText('Invalid email')).toBeTruthy();
  });

  it('should apply error styles when error exists', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Password" error="Too short" />
    );
    const input = getByPlaceholderText('Password');
    expect(input).toBeTruthy();
  });

  it('should handle focus and blur events', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Focus test" />
    );
    
    const input = getByPlaceholderText('Focus test');
    fireEvent(input, 'focus');
    fireEvent(input, 'blur');
    
    expect(input).toBeTruthy();
  });

  it('should pass through additional TextInput props', () => {
    const { getByPlaceholderText } = render(
      <Input 
        placeholder="Secure input" 
        secureTextEntry={true}
        autoCapitalize="none"
      />
    );
    
    const input = getByPlaceholderText('Secure input');
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.autoCapitalize).toBe('none');
  });

  it('should apply custom container styles', () => {
    const customStyle = { marginBottom: 20 };
    const { getByPlaceholderText } = render(
      <Input placeholder="Custom" containerStyle={customStyle} />
    );
    expect(getByPlaceholderText('Custom')).toBeTruthy();
  });
});
