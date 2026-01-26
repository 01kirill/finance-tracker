import { useEffect, useState } from 'react';
import {
  AppShell, Group, Text, Button, Container, Title,
  Grid, Card, ThemeIcon, Table
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconWallet, IconLogout, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { financeService } from '../services/finance.service';
import { authService } from '../services/auth.service';
import type { Wallet, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/currency';
import { CreateWalletModal } from '../components/CreateWalletModal';

export function Dashboard() {
  const [createWalletOpened, { open: openWalletModal, close: closeWalletModal }] = useDisclosure(false);

  const navigate = useNavigate();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [w, t, u] = await Promise.all([
        financeService.getWallets(),
        financeService.getTransactions(),
        authService.getMe()
      ]);
      setWallets(w);
      setTransactions(t);
      setUser(u);
    } catch (error) {
      console.error("Ошибка загрузки данных", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <ThemeIcon color="teal" size="lg" variant="light">
              <IconWallet />
            </ThemeIcon>
            <Text fw={700} size="lg">Finance Tracker</Text>
          </Group>

          <Group>
            <Text visibleFrom="xs">{user?.email}</Text>
            <Button variant="subtle" color="red" size="xs" onClick={handleLogout} leftSection={<IconLogout size={16}/>}>
              Выход
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main bg="gray.0">
        <Container size="lg" py="xl">
          {/* СЕКЦИЯ КОШЕЛЬКОВ */}
          <Group justify="space-between" mb="lg">
            <Title order={2}>Мои кошельки</Title>
            <Button leftSection={<IconPlus size={16} />} color="teal" onClick={openWalletModal}>
              Добавить счет
            </Button>
          </Group>

          <Grid>
            {wallets.length === 0 ? (
               <Text c="dimmed" ml="md">У вас пока нет кошельков. Создайте первый!</Text>
            ) : (
              wallets.map((wallet) => (
                <Grid.Col key={wallet.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500}>{wallet.name}</Text>
                      <ThemeIcon color="teal" variant="light">
                        <IconWallet size={16} />
                      </ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700} c="teal">
                      {formatCurrency(wallet.balance, wallet.currency)}
                    </Text>
                    <Text size="xs" c="dimmed" mt="sm">
                      ID: {wallet.id}
                    </Text>
                  </Card>
                </Grid.Col>
              ))
            )}
          </Grid>

          {/* СЕКЦИЯ ТРАНЗАКЦИЙ (Пока простая таблица) */}
          <Title order={3} mt={40} mb="md">Последние операции</Title>

          <Card shadow="sm" radius="md" withBorder>
            {transactions.length === 0 ? (
               <Text c="dimmed" p="md" ta="center">Транзакций пока нет</Text>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Дата</Table.Th>
                    <Table.Th>Описание</Table.Th>
                    <Table.Th>Сумма</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {transactions.map((t) => (
                    <Table.Tr key={t.id}>
                      <Table.Td>{t.date}</Table.Td>
                      <Table.Td>{t.description || '-'}</Table.Td>
                      <Table.Td
                        fw={700}
                        c={Number(t.amount) > 0 ? 'teal' : 'red'} // Это пока условно, т.к. бэк отдает абсолютное число, нужно смотреть категорию
                      >
                        {t.amount}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>

        </Container>
      </AppShell.Main>

      {/* МОДАЛЬНЫЕ ОКНА */}
      <CreateWalletModal
        opened={createWalletOpened}
        close={closeWalletModal}
        onWalletCreated={(newWallet) => setWallets([...wallets, newWallet])}
      />

    </AppShell>
  );
}