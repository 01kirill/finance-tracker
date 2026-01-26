import { useEffect } from 'react';
import { Modal, TextInput, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { financeService } from '../services/finance.service';

interface Props {
  opened: boolean;
  close: () => void;
  walletId: number | null;
  initialName: string;
  onWalletUpdated: () => void;
}

export function EditWalletModal({ opened, close, walletId, initialName, onWalletUpdated }: Props) {
  const form = useForm({
    initialValues: { name: '' },
    validate: { name: (val) => (val.length < 2 ? 'Слишком короткое' : null) },
  });

  useEffect(() => {
    if (opened) form.setValues({ name: initialName });
  }, [opened, initialName]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!walletId) return;
    try {
      await financeService.updateWallet(walletId, values.name);
      onWalletUpdated();
      close();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal opened={opened} onClose={close} title="Изменить кошелек" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="Название" required {...form.getInputProps('name')} />
        <Group justify="flex-end" mt="xl">
          <Button type="submit" color="teal">Сохранить</Button>
        </Group>
      </form>
    </Modal>
  );
}
