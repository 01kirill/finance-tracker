import { Container, Title, Text, Button, Group, Paper } from '@mantine/core';

export function Home() {
  return (
    <Container size="sm" mt="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Title order={1} ta="center" c="teal.9">
          Finance Tracker
        </Title>

        <Text c="dimmed" size="lg" ta="center" mt="md">
          Управляйте своими финансами эффективно.
          Красиво, удобно, безопасно.
        </Text>

        <Group justify="center" mt="xl">
          <Button size="lg" color="teal">Войти</Button>
          <Button size="lg" variant="outline" color="yellow">Регистрация</Button>
        </Group>
      </Paper>
    </Container>
  );
}
