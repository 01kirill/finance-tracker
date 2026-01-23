import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Text, Button, Loader, Center, Stack } from '@mantine/core';
import { authService } from '../services/auth.service';

export function Activate() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (uid && token) {
      authService.activate(uid, token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, [uid, token]);

  return (
    <Container size={420} my={80}>
      <Paper withBorder shadow="md" p={30} radius="md" ta="center">
        {status === 'loading' && (
          <Center>
            <Stack align="center" gap="xs">
              <Loader color="teal" size="lg" />
              <Text>Активация аккаунта...</Text>
            </Stack>
          </Center>
        )}

        {status === 'success' && (
          <>
            <Title order={2} c="teal">Успех! 🎉</Title>
            <Text mt="md">Ваш аккаунт успешно активирован.</Text>
            <Button mt="xl" fullWidth onClick={() => navigate('/login')} color="teal">
              Войти в систему
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Title order={2} c="red">Ошибка</Title>
            <Text mt="md">Ссылка недействительна или срок ее действия истек.</Text>
            <Button mt="xl" fullWidth variant="outline" onClick={() => navigate('/register')}>
              Попробовать снова
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}
