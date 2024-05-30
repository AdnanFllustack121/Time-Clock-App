import React, { useEffect, useState } from 'react';
import {
    IndexTable,
    Box,
    SkeletonBodyText,
    Text,
    Button,
    Icon,
    Divider,
    Tooltip, useSetIndexFiltersMode, IndexFilters
} from '@shopify/polaris';
import { ChatIcon } from '@shopify/polaris-icons';
import moment from 'moment';
import '../TimeClock/TodaysClockTable'

function formatTime(time) {
    return moment(time).format('HH:mm:ss');
}

function calculateDuration(inTime, outTime, forTotal, shiftRecords) {
    let diffInMilliseconds = 0
    // console.log('inTime, outTime', inTime, outTime);
    if (forTotal) {
        shiftRecords.forEach(({ in_time, out_time }) => {
            if (out_time) {
                diffInMilliseconds += new Date(out_time) - new Date(in_time);
            }
        });
    } else {
        if (outTime) diffInMilliseconds = Math.abs(new Date(outTime) - new Date(inTime));
    }

    // console.log('diffInMilliseconds',diffInMilliseconds);
    const hours = Math.floor(diffInMilliseconds / 3600000);
    const minutes = Math.floor((diffInMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((diffInMilliseconds % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function EmployeesClockTable({ shiftRecords, isLoadingTable }) {
    const [totalDuration, setTotalDuration] = useState("--");
    const { mode, setMode } = useSetIndexFiltersMode();

    useEffect(() => {
        if (!isLoadingTable) {
            const totalDurationString = calculateDuration('', '', true, shiftRecords);
            setTotalDuration(totalDurationString);
        }
    }, [shiftRecords, isLoadingTable]);

    const rowMarkup = shiftRecords?.map(({ _id, in_time, out_time, note, userDetails }, i) => (
        <IndexTable.Row key={_id}>
            <IndexTable.Cell><Text variant="bodyMd" fontWeight="bold">{i + 1}</Text></IndexTable.Cell>
            <IndexTable.Cell>{`${userDetails[0].firstName} ${userDetails[0].lastName}`}</IndexTable.Cell>
            <IndexTable.Cell>{moment(in_time).format('MMM DD, YYYY')}</IndexTable.Cell>
            <IndexTable.Cell>{formatTime(in_time)}</IndexTable.Cell>
            <IndexTable.Cell>{out_time ? moment(out_time).format('MMM DD, YYYY') : "--"}</IndexTable.Cell>
            <IndexTable.Cell>{out_time ? formatTime(out_time) : "--"}</IndexTable.Cell>
            <IndexTable.Cell>
                <Tooltip dismissOnMouseOut content={note ?? '---'}>
                    <Button
                        icon={<Icon source={ChatIcon} />}
                    />
                </Tooltip>
            </IndexTable.Cell>
            <IndexTable.Cell>{calculateDuration(in_time, out_time)}</IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <div className='table' style={{ marginBottom: '26px' }}>
            {isLoadingTable ?
                <Box paddingBlockStart="200">
                    <SkeletonBodyText lines={6} />
                </Box>
                :
                <>
                    <IndexFilters
                        queryValue={'sd'}
                        queryPlaceholder="Searching in all"
                        onQueryChange={(v) => console.log('value of search', v)}
                        cancelAction={{
                            onAction: () => '',
                            disabled: false,
                            loading: false,
                        }}
                        tabs={[]}
                        filters={[]}
                        mode={mode}
                        setMode={setMode}
                    />
                    <IndexTable
                        itemCount={shiftRecords?.length ?? 0}
                        headings={[
                            { title: 'No.' },
                            { title: 'Employee Name.' },
                            { title: 'In Date' },
                            { title: 'In Time' },
                            { title: 'Out Date' },
                            { title: 'Out Time' },
                            { title: 'Note' },
                            { title: 'Duration' },
                        ]}
                        selectable={false}
                        pagination={{
                            hasNext: true,
                            onNext: () => { },
                        }}
                    >
                        {rowMarkup}
                    </IndexTable>
                </>

            }
            {shiftRecords.length > 0 && <><Divider />
                <div className='total_hours'>
                    <Text variant="headingMd" as="h6">{`Total Hours: ${totalDuration}`}</Text>
                </div></>}
        </div>
    );
}
