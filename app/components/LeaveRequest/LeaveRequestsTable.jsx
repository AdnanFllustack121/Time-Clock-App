import React, { useCallback, useEffect, useState } from 'react';
import {
    IndexTable,
    Box,
    SkeletonBodyText,
    Icon,
    useSetIndexFiltersMode, IndexFilters, TextField, Text, ButtonGroup, Button, Tooltip, Divider
} from '@shopify/polaris';
import '../TimeClock/css/todaysClockTable.css'
import { XIcon, CheckIcon, ChatIcon } from '@shopify/polaris-icons';
import { showToast } from '../Toast';
import moment from 'moment'


export default function LeaveRequestsTable({ leaveRequestRecords, isLoadingTable, setCurrentPage, setCurrentQueryPage, totalPages,
    hasNextPage, hasPrevPage, setQueryValue, queryValue, setDateFilter, dateFilter, calculateItemNumber, leaveAdminAction, handleRejectToggle, isLoadingActionBTN }) {

    const { mode, setMode } = useSetIndexFiltersMode();

    const handleSelectingStartDate = (_v) => {
        setDateFilter((prev) => ({ ...prev, startDate: _v }))
    }

    const handleSelectingEndDate = (_v) => {
        if (!dateFilter.startDate) return showToast('Please select a start date first.')
        setDateFilter((prev) => ({ ...prev, endDate: _v }))
    }

    const handleFiltersQueryChange = useCallback((value) => setQueryValue(value), []);

    const filters = [
        {
            key: 'startDate',
            label: 'Applied from',
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
            label: 'Applied to',
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
    ];

    const removeStartDateFilter = () => {
        setDateFilter((_p) => ({
            ..._p,
            startDate: '',
        }))

    }

    const removeEndDateFilter = () => {
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

    const statusTextColor = {
        Pending: 'rgb(208, 208, 90)',
        Approved: 'rgb(80 148 95)',
        Rejected: 'rgb(208 90 90)'
    }

    const typeBGColor = {
        Festival: '#CAF4FF',
        Casual: '#ACE1AF',
        Sick: '#FFD0D0'
    }

    const typeTextColor = {
        Festival: '#006989',
        Casual: '#0A6847',
        Sick: '#EE4E4E'

    }

    const rowMarkup =
        leaveRequestRecords.length <= 0 ? [] : leaveRequestRecords?.map(({ _id, startDate, endDate, reason, type, createdAt, status, userDetails }, i) => {

            const differenceInMilliseconds = new Date(endDate) - new Date(startDate);
            const millisecondsInDay = 1000 * 60 * 60 * 24;

            const days = Math.floor(differenceInMilliseconds / millisecondsInDay);
            return (
                <IndexTable.Row key={_id}>
                    <IndexTable.Cell><Text variant="bodyMd" fontWeight="bold">{calculateItemNumber(i)}</Text></IndexTable.Cell>
                    <IndexTable.Cell>{`${userDetails.firstName} ${userDetails.lastName}`}</IndexTable.Cell>
                    <IndexTable.Cell>{endDate ? `${days + 1}  ${days + 1 === 1 ? 'day' : 'days'}` : '1 day'}</IndexTable.Cell>
                    <IndexTable.Cell>{`${moment(startDate).format('DD-MMM-YYYY')} ${endDate ? `to ${moment(endDate).format('DD-MMM-YYYY')}` : ''}`}</IndexTable.Cell>
                    <IndexTable.Cell>
                        <div className='typeBG' style={{ backgroundColor: typeBGColor[type] }}>
                            <p className='typeText' style={{ color: typeTextColor[type] }}>
                                {type}
                            </p>
                        </div>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{moment(createdAt).format('DD-MMM-YYYY, hh:mm:ss A')}</IndexTable.Cell>
                    <IndexTable.Cell>
                        <Tooltip dismissOnMouseOut content={reason ?? '---'}>
                            <Button
                                icon={<Icon source={ChatIcon} />}
                            />
                        </Tooltip>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        <p className='statusText' style={{ color: statusTextColor[status] }}>
                            {status}
                        </p>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        {status === 'Pending' ? (<div className='approveRejectBtn'>
                            <Button
                                variant="primary"
                                tone="success"
                                loading={isLoadingActionBTN[_id] === 'approve'}
                                icon={<Icon source={CheckIcon} />}
                                onClick={() => {
                                    leaveAdminAction(_id, 'approve');
                                }}
                            >
                                Approve
                            </Button>
                            <div style={{ marginBottom: '5px' }}></div>
                            <Button
                                variant="primary"
                                tone="critical"
                                icon={<Icon source={XIcon} />}
                                loading={isLoadingActionBTN[_id] === 'reject'}
                                onClick={() => {
                                    handleRejectToggle(_id, 'reject');
                                }}
                                style={{ alignSelf: 'flex-end' }}
                            >
                                Reject
                            </Button>

                        </div>) : '--'}
                    </IndexTable.Cell>


                </IndexTable.Row>
            )
        });

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
                        queryPlaceholder="Searching in name"
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
                        tabs={[]}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        canCreateNewView={false}
                        onClearAll={handleFiltersClearAll}
                        mode={mode}
                        setMode={setMode}
                    />
                    <IndexTable
                        itemCount={leaveRequestRecords?.length ?? 0}
                        headings={[
                            { title: 'No.' },
                            { title: 'Name' },
                            { title: 'Duration' },
                            { title: 'Date' },
                            { title: 'Leave Type' },
                            { title: 'Applied on' },
                            { title: 'Reason' },
                            { title: 'Status' },
                            { title: 'Action' },
                        ]}
                        selectable={false}
                        pagination={{
                            // below code is for if we dont want pagination on a datefilter
                            // hasNext: (dateFilter.startDate || dateFilter.endDate) ? false : hasNextPage,
                            // hasPrevious: (dateFilter.startDate || dateFilter.endDate) ? false : hasPrevPage,
                            hasNext: hasNextPage,
                            hasPrevious: hasPrevPage,
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
        </div>
    );

}
