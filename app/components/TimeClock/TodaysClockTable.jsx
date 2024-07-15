import React, { useEffect, useState } from 'react';
import {
  IndexTable,
  Box,
  SkeletonBodyText,
  Text,
  ButtonGroup,
  Button,
  Icon, Tooltip,
  Divider
} from '@shopify/polaris';
import { ChatIcon } from '@shopify/polaris-icons';
import moment from 'moment';
import './css/todaysClockTable.css';

function formatTime(time) {
  return moment(time).format('hh:mm:ss A');
}

function calculateDuration(inTime, outTime, forTotal, todaysAttendance) {
  let diffInMilliseconds = 0
  if (forTotal) {
    todaysAttendance.forEach(({ in_time, out_time }) => {
      if (out_time) {
        diffInMilliseconds += new Date(out_time) - new Date(in_time);
      }
    });
  } else {
    if (outTime) diffInMilliseconds = Math.abs(new Date(outTime) - new Date(inTime));
  }

  const hours = Math.floor(diffInMilliseconds / 3600000);
  const minutes = Math.floor((diffInMilliseconds % 3600000) / 60000);
  const seconds = Math.floor((diffInMilliseconds % 60000) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function TodaysClockTable({ todaysAttendance, isLoadingClockInCard, handleViewNote }) {
  const [totalDuration, setTotalDuration] = useState("--");

  useEffect(() => {
    if (!isLoadingClockInCard) {
      const totalDurationString = calculateDuration('', '', true, todaysAttendance);
      setTotalDuration(totalDurationString);
    }
  }, [todaysAttendance, isLoadingClockInCard]);

  const rowMarkup = todaysAttendance?.map(({ id, in_time, out_time, note }, i) => (
    <IndexTable.Row key={id}>
      <IndexTable.Cell><Text variant="bodyMd" fontWeight="bold">{i + 1}</Text></IndexTable.Cell>
      <IndexTable.Cell>{moment(in_time).format('MMM DD, YYYY')}</IndexTable.Cell>
      <IndexTable.Cell>{formatTime(in_time)}</IndexTable.Cell>
      <IndexTable.Cell>{out_time ? moment(out_time).format('MMM DD, YYYY') : "--"}</IndexTable.Cell>
      <IndexTable.Cell>{out_time ? formatTime(out_time) : "--"}</IndexTable.Cell>
      <IndexTable.Cell>
        <ButtonGroup>
          <Tooltip dismissOnMouseOut content={note ?? '---'}>
            <Button
              icon={<Icon source={ChatIcon} />}
              disabled={out_time ? false : true}
              onClick={() => handleViewNote(id, note)}
            />
          </Tooltip>
        </ButtonGroup>
      </IndexTable.Cell>
      <IndexTable.Cell>{calculateDuration(in_time, out_time)}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <div className='table' style={{ marginBottom: '26px' }}>
      {isLoadingClockInCard ?
        <Box paddingBlockStart="200">
          <SkeletonBodyText lines={6} />
        </Box>
        :
        <IndexTable
          itemCount={todaysAttendance?.length ?? 0}
          headings={[
            { title: 'No.' },
            { title: 'In Date' },
            { title: 'In Time' },
            { title: 'Out Date' },
            { title: 'Out Time' },
            { title: 'Note' },
            { title: 'Duration' },
          ]}
          selectable={false}
        >
          {rowMarkup}
        </IndexTable>
      }
      {todaysAttendance.length > 0 && <><Divider />
        <div className='total_hours'>
          <Text variant="headingMd" as="h6">{`Total Hours: ${totalDuration}`}</Text>
        </div></>}
    </div>
  );
}
