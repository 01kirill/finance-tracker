import { useState } from 'react';
import { TextInput, PasswordInput, Paper, Title, Container, Button, Anchor, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

export function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Некорректный email'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login(values);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Вход в систему</Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            required
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Пароль"
            placeholder="Ваш пароль"
            required
            mt="md"
            {...form.getInputProps('password')}
          />

          {error && (
            <Text c="red" size="sm" mt="sm">{error}</Text>
          )}

          <Button fullWidth mt="xl" type="submit" loading={loading} color="teal">
            Войти
          </Button>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Нет аккаунта?{' '}
          <Anchor size="sm" component="button" onClick={() => navigate('/register')}>
            Создать аккаунт
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}
