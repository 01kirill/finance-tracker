import { useEffect, useState } from 'react';
import {
  AppShell, Group, Text, Button, Container, Title,
  Grid, Card, ThemeIcon, Table, ActionIcon, Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconWallet, IconLogout, IconPlus, IconTrash, IconPencil, IconCategory
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { financeService } from '../services/finance.service';
import { authService } from '../services/auth.service';
import type { Wallet, Transaction, Category } from '../types/finance';
import { formatCurrency } from '../utils/currency';

import { CreateWalletModal } from '../components/CreateWalletModal';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import { EditWalletModal } from '../components/EditWalletModal';
import { EditCategoryModal } from '../components/EditCategoryModal';
import { AnalyticsChart } from '../components/AnalyticsChart.tsx';
import { TotalBalance } from '../components/TotalBalance';

export function Dashboard() {
  const [createWalletOpened, { open: openWalletModal, close: closeWalletModal }] = useDisclosure(false);
  const [createCategoryOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
  const [createTransactionOpened, { open: openTransactionModal, close: closeTransactionModal }] = useDisclosure(false);

  const [editWalletOpened, { open: openEditWallet, close: closeEditWallet }] = useDisclosure(false);
  const [editingWallet, setEditingWallet] = useState<{id: number, name: string} | null>(null);

  const [editCategoryOpened, { open: openEditCategory, close: closeEditCategory }] = useDisclosure(false);
  const [editingCategory, setEditingCategory] = useState<{id: number, title: string} | null>(null);

  const navigate = useNavigate();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<any>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async () => {
    try {
      const [w, c, t, u] = await Promise.all([
        financeService.getWallets(),
        financeService.getCategories(),
        financeService.getTransactions(),
        authService.getMe()
      ]);
      setWallets(w);
      setCategories(c);
      setTransactions(t);
      setUser(u);
    } catch (error) {
      console.error("Ошибка загрузки данных", error);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const handleLogout = () => { authService.logout(); navigate('/login'); };

  const handleDeleteWallet = (id: number, name: string) => modals.openConfirmModal({
    title: 'Удаление кошелька',
    children: <Text size="sm">Удалить кошелек <b>{name}</b> и все его операции?</Text>,
    labels: { confirm: 'Удалить', cancel: 'Отмена' },
    confirmProps: { color: 'red' },
    onConfirm: async () => {
      await financeService.deleteWallet(id);
      notifications.show({ title: 'Кошелек удален', color: 'teal', message: '' });
      fetchData();
      setRefreshKey(prev => prev + 1);
    },
  });

  const handleDeleteCategory = (id: number, title: string) => modals.openConfirmModal({
    title: 'Удаление категории',
    children: <Text size="sm">Удалить категорию <b>{title}</b>? Транзакции останутся без категории.</Text>,
    labels: { confirm: 'Удалить', cancel: 'Отмена' },
    confirmProps: { color: 'red' },
    onConfirm: async () => {
      await financeService.deleteCategory(id);
      notifications.show({ title: 'Категория удалена', color: 'teal', message: '' });
      fetchData();
      setRefreshKey(prev => prev + 1);
    },
  });

  const handleDeleteTransaction = (id: number) => modals.openConfirmModal({
    title: 'Удаление операции',
    children: <Text size="sm">Удалить запись? Баланс изменится.</Text>,
    labels: { confirm: 'Удалить', cancel: 'Отмена' },
    confirmProps: { color: 'red' },
    onConfirm: async () => {
      await financeService.deleteTransaction(id);
      notifications.show({ title: 'Операция удалена', color: 'teal', message: '' });
      fetchData();
      setRefreshKey(prev => prev + 1);
    },
  });

  const handleEditWalletClick = (wallet: Wallet) => {
    setEditingWallet({ id: wallet.id, name: wallet.name });
    openEditWallet();
  };

  const handleEditCategoryClick = (category: Category) => {
    setEditingCategory({ id: category.id, title: category.title });
    openEditCategory();
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <ThemeIcon color="teal" size="lg" variant="light"><IconWallet /></ThemeIcon>
            <Text fw={700} size="lg">Finance Tracker</Text>
          </Group>
          <Group>
            <Text visibleFrom="xs">{user?.email}</Text>
            <Button variant="subtle" color="red" size="xs" onClick={handleLogout} leftSection={<IconLogout size={16}/>}>Выход</Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main bg="gray.0">
        <Container size="lg" py="xl">

          {/* --- ОБЩИЙ БАЛАНС --- */}
          <TotalBalance refreshTrigger={refreshKey} />

          {/* --- КОШЕЛЬКИ --- */}
          <Group justify="space-between" mb="lg" mt="xl">
            <Title order={2}>Кошельки</Title>
            <Button leftSection={<IconPlus size={16} />} color="teal" onClick={openWalletModal}>Счет</Button>
          </Group>
          <Grid mb={40}>
            {wallets.length === 0 && <Text c="dimmed" ml="md">Нет кошельков</Text>}
            {wallets.map((wallet) => (
              <Grid.Col key={wallet.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs" style={{ flex: 1, overflow: 'hidden' }}>
                      <ThemeIcon color="teal" variant="light"><IconWallet size={16} /></ThemeIcon>
                      {/* TRUNCATE: Обрезаем длинное имя */}
                      <Text fw={500} truncate>{wallet.name}</Text>
                    </Group>
                    <Group gap={0}>
                       <ActionIcon variant="subtle" color="gray" onClick={() => handleEditWalletClick(wallet)}>
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteWallet(wallet.id, wallet.name)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text size="xl" fw={700} c="teal">{formatCurrency(wallet.balance, wallet.currency)}</Text>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* --- АНАЛИТИКА (ГРАФИК) --- */}
          <AnalyticsChart refreshTrigger={refreshKey} />

          {/* --- КАТЕГОРИИ --- */}
          <Group justify="space-between" mb="lg" mt={40}>
            <Title order={2}>Категории</Title>
            <Button leftSection={<IconPlus size={16} />} variant="default" onClick={openCategoryModal}>Категория</Button>
          </Group>
          <Grid mb={40}>
            {categories.length === 0 && <Text c="dimmed" ml="md">Нет категорий</Text>}
            {categories.map((cat) => (
              <Grid.Col key={cat.id} span={{ base: 6, sm: 4, md: 3 }}>
                <Card shadow="sm" padding="sm" radius="md" withBorder>
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <Group gap="xs" style={{ flex: 1, overflow: 'hidden' }}>
                      <ThemeIcon color={cat.transaction_type === 'INCOME' ? 'teal' : 'red'} variant="light" size="md">
                        <IconCategory size={18}/>
                      </ThemeIcon>
                      {/* TRUNCATE: Обрезаем длинное название */}
                      <Text size="sm" fw={600} truncate title={cat.title}>
                        {cat.title}
                      </Text>
                    </Group>

                    <Group gap={0}>
                      <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => handleEditCategoryClick(cat)}>
                        <IconPencil size={14} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDeleteCategory(cat.id, cat.title)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Badge
                    color={cat.transaction_type === 'INCOME' ? 'teal' : 'red'}
                    variant="light"
                    fullWidth
                    radius="sm"
                  >
                    {cat.transaction_type === 'INCOME' ? 'Доход' : 'Расход'}
                  </Badge>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* --- ТРАНЗАКЦИИ --- */}
          <Group justify="space-between" mb="md">
            <Title order={3}>Операции</Title>
            <Button color="teal" onClick={openTransactionModal}>+ Операция</Button>
          </Group>
          <Card shadow="sm" radius="md" withBorder>
            {transactions.length === 0 ? <Text c="dimmed" ta="center" p="md">Нет операций</Text> : (
              // SCROLL CONTAINER: Фикс для мобильных устройств
              <Table.ScrollContainer minWidth={800}>
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
                            <Badge color={t.category.transaction_type === 'INCOME' ? 'teal' : 'red'} variant="light">
                              {t.category.title}
                            </Badge>
                          ) : <Text size="sm" c="dimmed">-</Text>}
                        </Table.Td>
                        <Table.Td>
                            {/* Ограничиваем ширину и обрезаем */}
                            <div style={{ maxWidth: 120 }}>
                                <Text size="sm" truncate>{t.wallet.name}</Text>
                            </div>
                        </Table.Td>
                        <Table.Td>
                            <div style={{ maxWidth: 200 }}>
                                <Text size="sm" truncate>{t.description || '-'}</Text>
                            </div>
                        </Table.Td>
                        <Table.Td fw={700} c={t.category?.transaction_type === 'INCOME' ? 'teal' : 'red'}>
                          {t.category?.transaction_type === 'EXPENSE' ? '-' : '+'}{t.amount}
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteTransaction(t.id)}>
                              <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Card>

        </Container>
      </AppShell.Main>

      {/* --- MODALS --- */}
      <CreateWalletModal opened={createWalletOpened} close={closeWalletModal} onWalletCreated={(nw) => { setWallets([...wallets, nw]); setRefreshKey(k=>k+1); }} />
      <CreateCategoryModal opened={createCategoryOpened} close={closeCategoryModal} onCategoryCreated={fetchData} />

      <CreateTransactionModal
        opened={createTransactionOpened}
        close={closeTransactionModal}
        onTransactionCreated={() => {
            fetchData();
            setRefreshKey(prev => prev + 1); // Обновляем баланс и графики
            notifications.show({ title: 'Успешно', message: 'Операция добавлена', color: 'teal' });
        }}
      />

      <EditWalletModal
        opened={editWalletOpened}
        close={closeEditWallet}
        walletId={editingWallet?.id || null}
        initialName={editingWallet?.name || ''}
        onWalletUpdated={fetchData}
      />

      <EditCategoryModal
        opened={editCategoryOpened}
        close={closeEditCategory}
        categoryId={editingCategory?.id || null}
        initialTitle={editingCategory?.title || ''}
        onCategoryUpdated={fetchData}
      />

    </AppShell>
  );
}