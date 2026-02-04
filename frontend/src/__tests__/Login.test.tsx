import { Login } from '../pages/Login';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

const renderWithProviders = (ui: any) => {
  return render(
    <MantineProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </MantineProvider>
  );
};

describe('Login Page', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Вход в систему')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('has create account link', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Создать аккаунт')).toBeInTheDocument();
  });
});
