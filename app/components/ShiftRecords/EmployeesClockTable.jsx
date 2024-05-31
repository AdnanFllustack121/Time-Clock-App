import React, { useCallback, useEffect, useState } from 'react';
import {
    IndexTable,
    Box,
    SkeletonBodyText,
    Text,
    Button,
    Icon,
    Divider,
    Tooltip, useSetIndexFiltersMode, IndexFilters, TextField
} from '@shopify/polaris';
import { ChatIcon } from '@shopify/polaris-icons';
import moment from 'moment';
import '../TimeClock/css/todaysClockTable.css'
import { showToast } from '../Toast';

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

export default function EmployeesClockTable({ shiftRecords, isLoadingTable, setCurrentPage, setCurrentQueryPage, totalPages,
    hasNextPage, hasPrevPage, calculateItemNumber, setQueryValue, queryValue, setDateFilter, dateFilter }) {
    const [totalDuration, setTotalDuration] = useState("--");
    const { mode, setMode } = useSetIndexFiltersMode();
    const [itemStrings, setItemStrings] = useState([
        'Generate Report',
    ]);

    const handleSelectingStartDate = (_v) => {
        setDateFilter((prev) => ({ ...prev, startDate: _v }))
    }

    const handleSelectingEndDate = (_v) => {
        if (!dateFilter.startDate) return showToast('Please select a start date first.')
        setDateFilter((prev) => ({ ...prev, endDate: _v }))
    }

    const filters = [
        {
            key: 'startDate',
            label: 'Start date',
            filter: (
                <TextField
                    value={dateFilter.startDate}
                    onChange={handleSelectingStartDate}
                    autoComplete="off"
                    type='date'
                />
            ),
            shortcut: true,
        },
        {
            key: 'endDate',
            label: 'End date',
            filter: (
                <TextField
                    value={dateFilter.endDate}
                    onChange={handleSelectingEndDate}
                    autoComplete="off"
                    type='date'
                />
            ),
            shortcut: true,
        },
        // {
        //     key: 'RecordsOF',
        //     label: 'End date',
        //     filter: (
        //         <TextField
        //             value={dateFilter.endDate}
        //             onChange={handleSelectingEndDate}
        //             autoComplete="off"
        //             type='date'
        //         />
        //     ),
        //     shortcut: true,
        // },

    ];

    const removeStartDateFilter = () => {
        // console.log('startDate clear hit');
        setDateFilter((_p) => ({
            ..._p,
            startDate: '',
        }))

    }

    const removeEndDateFilter = () => {
        // console.log('endDate clear hit');
        setDateFilter((_p) => ({
            ..._p,
            endDate: ''
        }))
    }

    const handleFiltersClearAll = () => {
        setDateFilter({
            startDate: '',
            endDate: ''
        })
    }

    const appliedFilters = [{
        key: "startDate",
        onRemove: removeStartDateFilter,
    }, {
        key: "endDate",
        onRemove: removeEndDateFilter,
    }
    ]

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { console.log('hit generate report'); },

    }));

    const handleFiltersQueryChange = useCallback((value) => setQueryValue(value), []);


    useEffect(() => {
        if (!isLoadingTable) {
            const totalDurationString = calculateDuration('', '', true, shiftRecords);
            setTotalDuration(totalDurationString);
        }
    }, [shiftRecords, isLoadingTable]);

    const rowMarkup = shiftRecords.length <= 0 ? [] : shiftRecords?.map(({ _id, in_time, out_time, note, userDetails }, i) => (
        <IndexTable.Row key={_id}>
            <IndexTable.Cell><Text variant="bodyMd" fontWeight="bold">{calculateItemNumber(i)}</Text></IndexTable.Cell>
            <IndexTable.Cell>{`${userDetails?.firstName} ${userDetails?.lastName}`}</IndexTable.Cell>
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
        <div className='table' style={{
            // marginBottom: '26px'
        }}>
            {isLoadingTable ?
                <Box paddingBlockStart="200">
                    <SkeletonBodyText lines={10} />
                </Box>
                :
                <>
                    <IndexFilters
                        queryValue={queryValue}
                        queryPlaceholder="Searching in all"
                        onQueryChange={handleFiltersQueryChange}
                        onQueryFocus={() => setCurrentQueryPage(1)}
                        cancelAction={{
                            onAction: () => { setCurrentPage(1) },
                            disabled: false,
                            loading: false,
                        }}
                        onQueryClear={() => {
                            setQueryValue('')
                        }}
                        // tabs={tabs}
                        tabs={[]}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        canCreateNewView={false}
                        onClearAll={handleFiltersClearAll}
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
                            hasNext: (dateFilter.startDate || dateFilter.endDate) ? false : hasNextPage,
                            hasPrevious: (dateFilter.startDate || dateFilter.endDate) ? false : hasPrevPage,
                            onNext: () => {
                                if (queryValue.length > 0) {
                                    setCurrentQueryPage(prevPage => Math.min(prevPage + 1, totalPages))
                                } else {
                                    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))
                                }

                            },
                            onPrevious: () => {
                                if (queryValue.length > 0) {
                                    setCurrentQueryPage(prevPage => Math.max(prevPage - 1, 1))
                                } else {
                                    setCurrentPage(prevPage => Math.max(prevPage - 1, 1))

                                }
                            },
                        }}
                    >
                        {rowMarkup}
                    </IndexTable>
                </>

            }
            {shiftRecords.length > 0 && (dateFilter.startDate || dateFilter.endDate) && <><Divider />
                <div className='total_hours'>
                    <Text variant="headingMd" as="h6">{`Total Hours: ${totalDuration}`}</Text>
                </div></>}
        </div>
    );

    function isEmpty(value) {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === '' || value == null;
        }
    }
}
