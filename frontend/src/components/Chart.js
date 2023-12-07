// Chart.js
import React from "react";
import { Box, Text } from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const Chart = ({ chartId, chartTitle, chartData, lineProps }) => {
  return (
    <Box mb={6}>
      <Text fontSize="xl" fontWeight="bold" mb="4" color="white">
        {chartTitle}
      </Text>
      <LineChart id={chartId} width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line {...lineProps} />
      </LineChart>
    </Box>
  );
};

export default Chart;
