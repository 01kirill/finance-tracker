import { useEffect, useState } from 'react';
import {
  Paper, Title, SegmentedControl, Group, Text, Loader, Center, Select, SimpleGrid
} from '@mantine/core';
import { DateInput, MonthPickerInput, YearPickerInput } from '@mantine/dates';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { financeService } from '../services/finance.service';
import type { ExpenseStat } from '../types/finance';
import { formatCurrency } from '../utils/currency';
import { IconCalendar } from '@tabler/icons-react';

dayjs.locale('ru');

const COLORS_EXPENSE = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#A020F0', '#FF6384'];
const COLORS_INCOME = ['#20c997', '#087f5b', '#3bc9db', '#0b7285', '#69db7c', '#2f9e44'];

interface Props {
  refreshTrigger: number;
}

export function AnalyticsChart({ refreshTrigger }: Props) {
  const [period, setPeriod] = useState('month'); // day | week | month | year
  const [currency, setCurrency] = useState<string>('BYN');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [data, setData] = useState<ExpenseStat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!selectedDate) return;
    setLoading(true);

    const baseDate = dayjs(selectedDate);
    let start = baseDate;
    let end = baseDate;

    if (period === 'day') {
        start = baseDate.startOf('day');
        end = baseDate.endOf('day');
    } else if (period === 'week') {
        start = baseDate.startOf('week');
        end = baseDate.endOf('week');
    } else if (period === 'month') {
        start = baseDate.startOf('month');
        end = baseDate.endOf('month');
    } else if (period === 'year') {
        start = baseDate.startOf('year');
        end = baseDate.endOf('year');
    }

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
  }, [period, refreshTrigger, currency, type, selectedDate]);

  const chartData = data.map(item => ({
    name: item.category__title || 'Без категории',
    value: Number(item.total_amount),
  }));

  const totalSum = chartData.reduce((acc, item) => acc + item.value, 0);
  const currentColors = type === 'INCOME' ? COLORS_INCOME : COLORS_EXPENSE;

  const renderDatePicker = () => {
    const commonProps = {
      value: selectedDate,
      onChange: setSelectedDate,
      placeholder: "Выберите дату",
      leftSection: <IconCalendar size={16} />,
      clearable: false,
      w: "100%"
    };

    if (period === 'year') {
      return <YearPickerInput {...commonProps} valueFormat="YYYY" />;
    }
    if (period === 'month') {
      return <MonthPickerInput {...commonProps} valueFormat="MMMM YYYY" />;
    }
    return <DateInput {...commonProps} valueFormat="DD MMMM YYYY" />;
  };

  return (
    <Paper shadow="sm" radius="md" p="md" withBorder mt="xl">
      <Group justify="space-between" mb="sm" align="center">
        <Title order={3}>Аналитика</Title>

        <Group gap="xs">
            <SegmentedControl
              size="xs"
              value={type}
              onChange={(val) => setType(val as any)}
              color={type === 'INCOME' ? 'teal' : 'red'}
              data={[
                { label: 'Расходы', value: 'EXPENSE' },
                { label: 'Доходы', value: 'INCOME' },
              ]}
            />
            <Select
                size="xs"
                data={['BYN', 'USD', 'EUR']}
                value={currency}
                onChange={(val) => setCurrency(val || 'BYN')}
                w={70}
                allowDeselect={false}
            />
        </Group>
      </Group>

      {/* Адаптивная сетка: На мобильных в столбик, на планшетах в строку */}
      <SimpleGrid cols={{ base: 1, xs: 2 }} mb="lg">
        <SegmentedControl
          fullWidth
          value={period}
          onChange={(val) => {
             setPeriod(val);
             setSelectedDate(new Date());
          }}
          data={[
            { label: 'День', value: 'day' },
            { label: 'Неделя', value: 'week' },
            { label: 'Месяц', value: 'month' },
            { label: 'Год', value: 'year' },
          ]}
        />
        {renderDatePicker()}
      </SimpleGrid>

      {loading ? (
        <Center h={300}><Loader color="teal" /></Center>
      ) : chartData.length === 0 ? (
        <Center h={300}>
          <Text c="dimmed">
            Нет данных за выбранный период
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
                innerRadius={80}
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

          <Center mt={-160} style={{ pointerEvents: 'none' }}>
             <div style={{ textAlign: 'center' }}>
               <Text c="dimmed" size="xs">Итого</Text>
               <Text fw={700} size="xl" c={type === 'INCOME' ? 'teal' : 'red'}>
                 {formatCurrency(totalSum, currency)}
               </Text>
             </div>
          </Center>
          <div style={{ height: 100 }}></div>
        </div>
      )}
    </Paper>
  );
}
