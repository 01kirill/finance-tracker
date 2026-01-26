import { Modal, TextInput, Select, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { financeService } from '../services/finance.service';
import type { Wallet } from '../types/finance';

interface Props {
  opened: boolean;
  close: () => void;
  onWalletCreated: (wallet: Wallet) => void;
}

export function CreateWalletModal({ opened, close, onWalletCreated }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      currency: 'BYN',
    },
    validate: {
      name: (val) => (val.length < 2 ? 'Название слишком короткое' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const newWallet = await financeService.createWallet(values);
      onWalletCreated(newWallet);
      form.reset();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={close} title="Новый кошелек" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Название"
          placeholder="Например: Карта Сбер"
          required
          {...form.getInputProps('name')}
        />

        <Select
          mt="md"
          label="Валюта"
          data={[
            { value: 'BYN', label: 'Рубль (р)' },
            { value: 'USD', label: 'Доллар ($)' },
            { value: 'EUR', label: 'Евро (€)' },
          ]}
          {...form.getInputProps('currency')}
          allowDeselect={false}
        />

        <Group justify="flex-end" mt="xl">
          <Button type="submit" loading={loading} color="teal">
            Создать
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
