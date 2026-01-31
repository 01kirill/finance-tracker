import { useEffect, useState } from 'react';
import { Paper, Group, Text, Select, Loader, Title } from '@mantine/core';
import { IconCoin } from '@tabler/icons-react';
import { financeService } from '../services/finance.service';
import { formatCurrency } from '../utils/currency';

interface Props {
  refreshTrigger: number;
}

export function TotalBalance({ refreshTrigger }: Props) {
  const [total, setTotal] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('BYN');
  const [loading, setLoading] = useState(false);

  const fetchTotal = async () => {
    setLoading(true);
    try {
      const data = await financeService.getTotalBalance(currency);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotal();
  }, [currency, refreshTrigger]);

  return (
    <Paper shadow="xs" radius="md" p="xl" withBorder bg="teal.0">
      <Group justify="space-between" align="center">
        <div>
          <Group gap="xs" mb={5}>
            <IconCoin size={20} color="teal" />
            <Text c="dimmed" tt="uppercase" fw={700} size="xs">
              Общий капитал
            </Text>
          </Group>

          {loading ? (
            <Loader size="sm" color="teal" mt={5} />
          ) : (
            <Title order={1} c="teal.9">
              {formatCurrency(total, currency)}
            </Title>
          )}
        </div>

        <Select
          data={['BYN', 'USD', 'EUR']}
          value={currency}
          onChange={(val) => setCurrency(val || 'BYN')}
          allowDeselect={false}
          w={90}
          variant="filled"
        />
      </Group>
    </Paper>
  );
}
