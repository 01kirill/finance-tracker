import { useEffect, useState } from 'react';
import { Modal, NumberInput, Select, Button, Group, TextInput, SegmentedControl } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { financeService } from '../services/finance.service';
import type { Wallet, Category} from '../types/finance';
import dayjs from 'dayjs';

interface Props {
  opened: boolean;
  close: () => void;
  onTransactionCreated: () => void;
}

export function CreateTransactionModal({ opened, close, onTransactionCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [type, setType] = useState('EXPENSE');

  useEffect(() => {
    if (opened) {
      financeService.getWallets().then(setWallets);
      financeService.getCategories().then(setCategories);
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      amount: 0,
      date: new Date(),
      description: '',
      wallet: '',
      category: '',
    },
    validate: {
      amount: (val) => (val <= 0 ? 'Сумма должна быть больше 0' : null),
      wallet: (val) => (!val ? 'Выберите кошелек' : null),
      category: (val) => (!val ? 'Выберите категорию' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await financeService.createTransaction({
        ...values,
        wallet: Number(values.wallet),
        category: Number(values.category),
        date: dayjs(values.date).format('YYYY-MM-DD'),
      });
      onTransactionCreated();
      form.reset();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories
    .filter(c => c.transaction_type === type)
    .map(c => ({ value: String(c.id), label: c.title }));

  const walletOptions = wallets.map(w => ({
    value: String(w.id),
    label: `${w.name} (${w.currency})`
  }));

  return (
    <Modal opened={opened} onClose={close} title="Новая операция" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {/* Переключатель Доход/Расход */}
        <SegmentedControl
          fullWidth
          value={type}
          onChange={(val) => {
            setType(val);
            form.setFieldValue('category', ''); // Сбрасываем категорию при смене типа
          }}
          data={[
            { label: 'Расход', value: 'EXPENSE' },
            { label: 'Доход', value: 'INCOME' },
          ]}
          mb="md"
          color={type === 'INCOME' ? 'teal' : 'red'}
        />

        <DateInput
          label="Дата"
          placeholder="Дата операции"
          required
          {...form.getInputProps('date')}
        />

        <NumberInput
          label="Сумма"
          placeholder="0.00"
          required
          mt="md"
          min={0}
          allowNegative={false}
          decimalScale={2}
          {...form.getInputProps('amount')}
        />

        <Select
          label="Кошелек"
          placeholder="Выберите счет"
          data={walletOptions}
          required
          mt="md"
          {...form.getInputProps('wallet')}
        />

        <Select
          label="Категория"
          placeholder="Выберите категорию"
          data={filteredCategories}
          required
          mt="md"
          searchable
          {...form.getInputProps('category')}
          nothingFoundMessage="Нет категорий этого типа"
        />

        <TextInput
          label="Описание"
          placeholder="Комментарий (необязательно)"
          mt="md"
          {...form.getInputProps('description')}
        />

        <Group justify="flex-end" mt="xl">
          <Button type="submit" loading={loading} color="teal">
            Сохранить
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
