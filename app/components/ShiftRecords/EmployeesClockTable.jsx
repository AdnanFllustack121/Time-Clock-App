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
import { ChatIcon, ClockIcon } from '@shopify/polaris-icons';
import moment from 'moment';
import '../TimeClock/css/todaysClockTable.css'
import { showToast } from '../Toast';
import ModalComponent from '../ModalComponent';
import { useSnapshot } from 'valtio';
import { store } from '../../valtio/store';

function formatTime(time) {
    return moment(time).format('hh:mm:ss A');
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
    hasNextPage, hasPrevPage, calculateItemNumber, setQueryValue, queryValue, setDateFilter, dateFilter, setShiftRecords }) {
    const [totalDuration, setTotalDuration] = useState("--");
    const { mode, setMode } = useSetIndexFiltersMode();
    const [itemStrings, setItemStrings] = useState([
        'Generate Report',
    ]);
    const [isLoadingButton, setLoadingButton] = useState(false)
    const [openNoteModal, setOpenNoteModal] = useState({
        isOpen: false,
        type: 'adminClockOut',
        idToClockout: ''
    })
    const [clockOutFields, setClockOutFields] = useState({
        out_time: '',
        note: ''
    })
    const snap = useSnapshot(store)

    const handleSelectingStartDate = (_v) => {
        setDateFilter((prev) => ({ ...prev, startDate: _v }))
    }

    const toggleClockoutModal = (id) => {
        openNoteModal.isOpen && setClockOutFields({
            out_time: '',
            note: ''
        })
        setOpenNoteModal((prev) => ({
            isOpen: !prev.isOpen,
            type: 'adminClockOut',
            idToClockout: !prev.isOpen ? id : ''
        }))

    }

    const handleSelectingEndDate = (_v) => {
        if (!dateFilter.startDate) return showToast('Please select a start date first.')
        setDateFilter((prev) => ({ ...prev, endDate: _v }))
    }

    const filters = [
        {
            key: 'startDate',
            label: 'In date from',
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
            label: 'In date to',
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

    const handleClockOut = useCallback(async () => {
        // console.log('clockOutFields', clockOutFields);
        // console.log('openNoteModal.idToClockout', openNoteModal.idToClockout);
        const clockedOutTime = shiftRecords.filter(_d => _d._id === openNoteModal.idToClockout)[0]?.in_time
        // console.log('clockedOutTime', clockedOutTime);

        // console.log('new Date(clockOutFields.out_time)  new Date(clockedOutTime)', new Date(clockOutFields.out_time), '<', new Date(clockedOutTime));

        if (clockOutFields.out_time.length < 1) return showToast("Please fill in the 'date and time' field. It is required to clock out.")
        if (new Date(clockOutFields.out_time) < new Date(clockedOutTime)) return showToast("Clock-out time cannot be earlier than the clock-in time.")

        setLoadingButton(true)
        const apiData = {
            out_time: new Date(clockOutFields.out_time),
            email: snap.user.email,
            status: "Complete",
            note: clockOutFields.note,
            idToUpdate: openNoteModal.idToClockout
        }
        // console.log('out-time apiData', apiData);

        try {
            const response = await fetch('/api/attendance', {
                method: 'post',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(apiData)
            })

            if (response.ok) {
                const { message, attendanceData } = await response.json()
                showToast(message)

                setShiftRecords(prevAttendance =>
                    prevAttendance.map(d =>
                        d._id === openNoteModal.idToClockout ? { ...d, note: clockOutFields.note, out_time: clockOutFields.out_time, status: 'Complete' } : d
                    )
                );

            }

        } catch (error) {
            console.log('error on clockIn', error);
        } finally {
            setLoadingButton(false)
            toggleClockoutModal()
        }
    }, [clockOutFields, shiftRecords])

    const handleAdminInputChange = (data, type) => {
        console.log('handleAdminInputChange data', data, '  ', type);
        setClockOutFields(_prev => ({ ..._prev, [type]: data }))
    }

    const rowMarkup = shiftRecords.length <= 0 ? [] : shiftRecords?.map(({ _id, in_time, out_time, note, userDetails, status }, i) => (
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
            <IndexTable.Cell>
                {status === 'Incomplete' ?
                    <Text tone='critical'>
                        {status}
                    </Text>
                    :
                    <Text tone='success'>
                        {status}
                    </Text>
                }
            </IndexTable.Cell>
            <IndexTable.Cell>
                {status === 'Incomplete' ?
                    <Button
                        onClick={() => toggleClockoutModal(_id)}
                        // size="large"
                        icon={<Icon source={ClockIcon} />}
                        tone='critical'
                    >
                        Clock Out
                    </Button> : '--'}
            </IndexTable.Cell>

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
                        queryPlaceholder="Searching in employee name"
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
                            { title: 'Status' },
                            { title: 'Action' },
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

            <ModalComponent
                isTrue={openNoteModal.isOpen}
                toggleModal={toggleClockoutModal}
                handlePrimaryAction={handleClockOut}
                type={openNoteModal.type}
                primaryContent={"Save"}
                secondaryContent={"Cancel"}
                value={clockOutFields}
                handleAdminInputChange={handleAdminInputChange}
                isLoadingButton={isLoadingButton}
            />
        </div>
    );
}
