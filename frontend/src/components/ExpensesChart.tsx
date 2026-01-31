import { useEffect, useState } from 'react';
import { Paper, Title, SegmentedControl, Group, Text, Loader, Center, Select } from '@mantine/core';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import dayjs from 'dayjs';
import { financeService } from '../services/finance.service';
import type { ExpenseStat } from '../types/finance';
import { formatCurrency } from '../utils/currency';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#FF6384', '#36A2EB'];

interface Props {
  refreshTrigger: number;
}

export function ExpensesChart({ refreshTrigger }: Props) {
  const [period, setPeriod] = useState('month');
  const [currency, setCurrency] = useState<string>('BYN');

  const [data, setData] = useState<ExpenseStat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    const end = dayjs();
    let start = dayjs();

    if (period === 'week') start = end.subtract(7, 'day');
    if (period === 'month') start = end.startOf('month');
    if (period === 'year') start = end.startOf('year');

    try {
      const stats = await financeService.getExpenseStats(
        start.format('YYYY-MM-DD'),
        end.format('YYYY-MM-DD'),
        currency
      );
      setData(stats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period, refreshTrigger, currency]);

  const chartData = data.map(item => ({
    name: item.category__title || 'Без категории',
    value: Number(item.total_amount),
  }));

  const totalSum = chartData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Paper shadow="sm" radius="md" p="md" withBorder mt="xl">
      <Group justify="space-between" mb="lg" align="center">
        <Title order={3}>Аналитика расходов</Title>

        <Group>
            {/* Выбор валюты графика */}
            <Select
                data={['BYN', 'USD', 'EUR']}
                value={currency}
                onChange={(val) => setCurrency(val || 'BYN')}
                w={80}
                allowDeselect={false}
            />

            {/* Выбор периода */}
            <SegmentedControl
            value={period}
            onChange={setPeriod}
            data={[
                { label: 'Неделя', value: 'week' },
                { label: 'Месяц', value: 'month' },
                { label: 'Год', value: 'year' },
            ]}
            />
        </Group>
      </Group>

      {loading ? (
        <Center h={300}><Loader color="teal" /></Center>
      ) : chartData.length === 0 ? (
        <Center h={300}><Text c="dimmed">Нет расходов за этот период</Text></Center>
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {/* Форматируем тултип и итог в выбранной валюте */}
              <Tooltip formatter={(value) => formatCurrency(value as number, currency)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <Center mt="md">
             <Text fw={700} size="lg">
               Итого: {formatCurrency(totalSum, currency)}
             </Text>
          </Center>
        </div>
      )}
    </Paper>
  );
}
