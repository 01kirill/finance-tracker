import { useEffect, useState } from 'react';
import { Paper, Title, SegmentedControl, Group, Text, Loader, Center, Select } from '@mantine/core';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import dayjs from 'dayjs';
import { financeService } from '../services/finance.service';
import type{ ExpenseStat } from '../types/finance';
import { formatCurrency } from '../utils/currency';

const COLORS_EXPENSE = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#A020F0', '#FF6384'];
const COLORS_INCOME = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#A020F0', '#FF6384'];

interface Props {
  refreshTrigger: number;
}

export function ExpensesChart({ refreshTrigger }: Props) {
  const [period, setPeriod] = useState('month'); // day | week | month | year
  const [currency, setCurrency] = useState<string>('BYN');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE'); // <-- Тип операции

  const [data, setData] = useState<ExpenseStat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);

    const end = dayjs().endOf('day');
    let start = dayjs().startOf('day');

    if (period === 'week') start = dayjs().subtract(6, 'day').startOf('day'); // Последние 7 дней
    if (period === 'month') start = dayjs().startOf('month');
    if (period === 'year') start = dayjs().startOf('year');

    try {
      const stats = await financeService.getStats(
        start.format('YYYY-MM-DD'),
        end.format('YYYY-MM-DD'),
        currency,
        type
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
  }, [period, refreshTrigger, currency, type]);

  const chartData = data.map(item => ({
    name: item.category__title || 'Без категории',
    value: Number(item.total_amount),
  }));

  const totalSum = chartData.reduce((acc, item) => acc + item.value, 0);
  const currentColors = type === 'INCOME' ? COLORS_INCOME : COLORS_EXPENSE;

  return (
    <Paper shadow="sm" radius="md" p="md" withBorder mt="xl">
      <Group justify="space-between" mb="lg" align="center">
        <Title order={3}>Аналитика</Title>

        <Group>
            {/* Выбор: Доход или Расход */}
            <SegmentedControl
              value={type}
              onChange={(val) => setType(val as any)}
              color={type === 'INCOME' ? 'teal' : 'red'}
              data={[
                { label: 'Расходы', value: 'EXPENSE' },
                { label: 'Доходы', value: 'INCOME' },
              ]}
            />

            <Select
                data={['BYN', 'USD', 'EUR']}
                value={currency}
                onChange={(val) => setCurrency(val || 'BYN')}
                w={80}
                allowDeselect={false}
            />
        </Group>
      </Group>

      {/* Период вынесли на новую строку для удобства на мобилках */}
      <SegmentedControl
        fullWidth
        value={period}
        onChange={setPeriod}
        mb="lg"
        data={[
          { label: 'Сегодня', value: 'day' }, // <-- Новый фильтр
          { label: 'Неделя', value: 'week' },
          { label: 'Месяц', value: 'month' },
          { label: 'Год', value: 'year' },
        ]}
      />

      {loading ? (
        <Center h={300}><Loader color="teal" /></Center>
      ) : chartData.length === 0 ? (
        <Center h={300}>
          <Text c="dimmed">
            Нет {type === 'INCOME' ? 'доходов' : 'расходов'} за этот период
          </Text>
        </Center>
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80} // Чуть тоньше пончик
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} stroke="none"/>
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number, currency)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <Center mt={-160} style={{ pointerEvents: 'none' }}> {/* Хак: текст внутри пончика */}
             <div style={{ textAlign: 'center' }}>
               <Text c="dimmed" size="xs">Итого</Text>
               <Text fw={700} size="xl" c={type === 'INCOME' ? 'teal' : 'red'}>
                 {formatCurrency(totalSum, currency)}
               </Text>
             </div>
          </Center>
          <div style={{ height: 100 }}></div> {/* Распорка, т.к. текст внутри */}
        </div>
      )}
    </Paper>
  );
}
