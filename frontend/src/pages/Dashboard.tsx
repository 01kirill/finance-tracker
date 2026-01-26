import { useEffect, useState } from 'react';
import {
  AppShell, Group, Text, Button, Container, Title,
  Grid, Card, ThemeIcon, Table, ActionIcon
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconWallet, IconLogout, IconPlus, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { financeService } from '../services/finance.service';
import { authService } from '../services/auth.service';
import type { Wallet, Transaction } from '../types/finance';
import { formatCurrency } from '../utils/currency';
import { CreateWalletModal } from '../components/CreateWalletModal';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { CreateTransactionModal } from '../components/CreateTransactionModal';

export function Dashboard() {
  const [createWalletOpened, { open: openWalletModal, close: closeWalletModal }] = useDisclosure(false);
  const [createCategoryOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
  const [createTransactionOpened, { open: openTransactionModal, close: closeTransactionModal }] = useDisclosure(false);

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

  const openDeleteWalletModal = (id: number, name: string) => modals.openConfirmModal({
    title: 'Удаление кошелька',
    centered: true,
    children: (
      <Text size="sm">
        Вы уверены, что хотите удалить кошелек <b>{name}</b>?
        <br />
        Все связанные транзакции также будут безвозвратно удалены.
      </Text>
    ),
    labels: { confirm: 'Удалить', cancel: 'Отмена' },
    confirmProps: { color: 'red' },
    onConfirm: async () => {
      try {
        await financeService.deleteWallet(id);

        notifications.show({
          title: 'Успешно',
          message: 'Кошелек удален',
          color: 'teal',
          icon: <IconCheck size={16} />,
        });

        setWallets(wallets.filter(w => w.id !== id));
        const t = await financeService.getTransactions();
        setTransactions(t);
      } catch (e) {
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось удалить кошелек',
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
    },
  });

  const openDeleteTransactionModal = (id: number) => modals.openConfirmModal({
    title: 'Удаление операции',
    centered: true,
    children: (
      <Text size="sm">
        Вы действительно хотите удалить эту запись?
        Баланс кошелька будет пересчитан.
      </Text>
    ),
    labels: { confirm: 'Удалить', cancel: 'Отмена' },
    confirmProps: { color: 'red' },
    onConfirm: async () => {
      try {
        await financeService.deleteTransaction(id);

        notifications.show({
          title: 'Успешно',
          message: 'Операция удалена',
          color: 'teal',
          icon: <IconCheck size={16} />,
        });

        fetchData();
      } catch (e) {
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось удалить операцию',
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
    },
  });

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
                      <Group gap="xs">
                        <ThemeIcon color="teal" variant="light">
                          <IconWallet size={16} />
                        </ThemeIcon>
                        <Text fw={500}>{wallet.name}</Text>
                      </Group>
                      {/* Вызываем красивую модалку */}
                      <ActionIcon variant="subtle" color="gray" onClick={() => openDeleteWalletModal(wallet.id, wallet.name)}>
                        <IconTrash size={16} />
                      </ActionIcon>
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

          <Group justify="space-between" mt={40} mb="md">
            <Title order={3}>Последние операции</Title>
            <Group>
                <Button variant="default" onClick={openCategoryModal}>
                    + Категория
                </Button>
                <Button color="teal" onClick={openTransactionModal}>
                    + Операция
                </Button>
            </Group>
          </Group>

          <Card shadow="sm" radius="md" withBorder>
            {transactions.length === 0 ? (
               <Text c="dimmed" p="md" ta="center">Транзакций пока нет</Text>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Дата</Table.Th>
                    <Table.Th>Категория</Table.Th>
                    <Table.Th>Кошелек</Table.Th>
                    <Table.Th>Описание</Table.Th>
                    <Table.Th>Сумма</Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {transactions.map((t) => (
                    <Table.Tr key={t.id}>
                      <Table.Td>{t.date}</Table.Td>

                      <Table.Td>
                        {t.category ? (
                          <Text size="sm" c={t.category.transaction_type === 'INCOME' ? 'teal' : 'red'}>
                            {t.category.title}
                          </Text>
                        ) : (
                          <Text size="sm" c="dimmed">Без категории</Text>
                        )}
                      </Table.Td>

                      <Table.Td>
                         <Text size="sm">{t.wallet.name}</Text>
                      </Table.Td>

                      <Table.Td>{t.description || '-'}</Table.Td>

                      <Table.Td
                        fw={700}
                        c={t.category?.transaction_type === 'INCOME' ? 'teal' : 'red'}
                      >
                        {t.category?.transaction_type === 'EXPENSE' ? '-' : '+'}{t.amount}
                      </Table.Td>

                      <Table.Td>
                        {/* Вызываем красивую модалку */}
                        <ActionIcon color="red" variant="subtle" onClick={() => openDeleteTransactionModal(t.id)}>
                            <IconTrash size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>

        </Container>
      </AppShell.Main>

      <CreateWalletModal
        opened={createWalletOpened}
        close={closeWalletModal}
        onWalletCreated={(newWallet) => {
            setWallets([...wallets, newWallet]);
            notifications.show({ title: 'Успешно', message: 'Кошелек создан', color: 'teal' });
        }}
      />

      <CreateCategoryModal
        opened={createCategoryOpened}
        close={closeCategoryModal}
        onCategoryCreated={() => {
            notifications.show({ title: 'Успешно', message: 'Категория создана', color: 'teal' });
        }}
      />

      <CreateTransactionModal
        opened={createTransactionOpened}
        close={closeTransactionModal}
        onTransactionCreated={() => {
            fetchData();
            notifications.show({ title: 'Успешно', message: 'Операция добавлена', color: 'teal' });
        }}
      />

    </AppShell>
  );
}