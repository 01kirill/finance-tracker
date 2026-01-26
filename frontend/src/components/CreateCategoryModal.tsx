import { Modal, TextInput, Select, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { financeService } from '../services/finance.service';
import type { Category } from '../types/finance';

interface Props {
  opened: boolean;
  close: () => void;
  onCategoryCreated: (category: Category) => void;
}

export function CreateCategoryModal({ opened, close, onCategoryCreated }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: '',
      transaction_type: 'EXPENSE',
    },
    validate: {
      title: (val) => (val.length < 2 ? 'Название слишком короткое' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const newCategory = await financeService.createCategory(values); // Этого метода еще нет в сервисе, добавим ниже
      onCategoryCreated(newCategory);
      form.reset();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={close} title="Новая категория" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Название"
          placeholder="Еда, Зарплата, Такси"
          required
          {...form.getInputProps('title')}
        />

        <Select
          mt="md"
          label="Тип операции"
          data={[
            { value: 'EXPENSE', label: 'Расход' },
            { value: 'INCOME', label: 'Доход' },
          ]}
          {...form.getInputProps('transaction_type')}
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
