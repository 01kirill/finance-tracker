import { useEffect } from 'react';
import { Modal, TextInput, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { financeService } from '../services/finance.service';

interface Props {
  opened: boolean;
  close: () => void;
  categoryId: number | null;
  initialTitle: string;
  onCategoryUpdated: () => void;
}

export function EditCategoryModal({ opened, close, categoryId, initialTitle, onCategoryUpdated }: Props) {
  const form = useForm({
    initialValues: { title: '' },
    validate: { title: (val) => (val.length < 2 ? 'Слишком короткое' : null) },
  });

  useEffect(() => {
    if (opened) form.setValues({ title: initialTitle });
  }, [opened, initialTitle]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!categoryId) return;
    try {
      await financeService.updateCategory(categoryId, values.title);
      onCategoryUpdated();
      close();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal opened={opened} onClose={close} title="Изменить категорию" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="Название" required {...form.getInputProps('title')} />
        <Group justify="flex-end" mt="xl">
          <Button type="submit" color="teal">Сохранить</Button>
        </Group>
      </form>
    </Modal>
  );
}
