import { useState, useEffect } from 'react';
import { TextInput, PasswordInput, Paper, Title, Container, Button, Text, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Очищаем старые токены при открытии страницы,
  // чтобы не отправлять заголовок с протухшим токеном (ошибка 401)
  useEffect(() => {
    authService.logout();
  }, []);

  const form = useForm({
    initialValues: {
      email: '',
      first_name: '',
      password: '',
      re_password: '', // Важно: поле называется re_password (требование Djoser)
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Некорректный email'),
      password: (val) => (val.length < 8 ? 'Минимум 8 символов' : null),
      re_password: (val, values) => (val !== values.password ? 'Пароли не совпадают' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(values);
      setSuccess(true); // Показываем сообщение об успехе
    } catch (err: any) {
      // Пытаемся достать текст ошибки от сервера
      const errorData = err.response?.data;
      // Если сервер вернул список ошибок пароля, берем первую, иначе общую
      const msg = errorData?.password?.[0] || errorData?.email?.[0] || 'Ошибка регистрации';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p={30} radius="md" ta="center">
          <Title order={2} c="teal">Проверьте почту!</Title>
          <Text mt="md" size="lg">
            Мы отправили письмо на <b>{form.values.email}</b>.
            Перейдите по ссылке в письме, чтобы активировать аккаунт.
          </Text>
          <Button mt="xl" variant="outline" onClick={() => navigate('/login')}>
            Вернуться ко входу
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center">Регистрация</Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            required
            {...form.getInputProps('email')}
          />
          <TextInput
            label="Имя"
            placeholder="Иван"
            mt="md"
            {...form.getInputProps('first_name')}
          />

          <PasswordInput
            label="Пароль"
            placeholder="Min 8 chars"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          <PasswordInput
            label="Повторите пароль"
            placeholder="Confirm password"
            required
            mt="md"
            {...form.getInputProps('re_password')}
          />

          {error && <Text c="red" size="sm" mt="sm">{error}</Text>}

          <Button fullWidth mt="xl" type="submit" loading={loading} color="teal">
            Создать аккаунт
          </Button>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Уже есть аккаунт?{' '}
          <Anchor size="sm" component="button" onClick={() => navigate('/login')}>
            Войти
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}