import React, { useCallback, useEffect, useState } from 'react';
import {
    IndexTable,
    Box,
    SkeletonBodyText,
    Text,
    Button,
    Icon,
    Divider,
    Tooltip,
    useSetIndexFiltersMode,
    IndexFilters,
    TextField,
    ButtonGroup
} from '@shopify/polaris';
import { ChatIcon, ClockIcon, EditIcon } from '@shopify/polaris-icons';
import moment from 'moment';
import '../TimeClock/css/todaysClockTable.css';
import { showToast } from '../Toast';
import ModalComponent from '../ModalComponent';
import { useSnapshot } from 'valtio';
import { store } from '../../valtio/store';

function formatTime(time) {
    return moment(time).format('hh:mm:ss A');
}

function calculateDuration(inTime, outTime, forTotal, shiftRecords) {
    let diffInMilliseconds = 0;

    if (forTotal) {
        shiftRecords.forEach(({ in_time, out_time }) => {
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

const EmployeesClockTable = ({
    shiftRecords,
    isLoadingTable,
    setCurrentPage,
    setCurrentQueryPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    calculateItemNumber,
    setQueryValue,
    queryValue,
    setDateFilter,
    dateFilter,
    setShiftRecords
}) => {
    const [totalDuration, setTotalDuration] = useState("--");
    const { mode, setMode } = useSetIndexFiltersMode();
    const [isLoadingButton, setLoadingButton] = useState(false);
    const [openClockOutModal, setOpenClockOutModal] = useState({ isOpen: false, type: '', idToAction: '' });
    const [clockOutFields, setClockOutFields] = useState({ out_time: '', note: '' });
    const [adminEditFields, setAdminEditFields] = useState({ out_time: '', in_time: '', in_date: '', out_date: '' });
    const snap = useSnapshot(store);

    const handleSelectingStartDate = useCallback((value) => {
        setDateFilter(prev => ({ ...prev, startDate: value }));
    }, [setDateFilter]);

    const handleSelectingEndDate = useCallback((value) => {
        if (!dateFilter.startDate) return showToast('Please select a start date first.');
        setDateFilter(prev => ({ ...prev, endDate: value }));
    }, [dateFilter.startDate, setDateFilter]);

    const removeFilter = useCallback((key) => {
        setDateFilter(prev => ({ ...prev, [key]: '' }));
    }, [setDateFilter]);

    const handleFiltersClearAll = useCallback(() => {
        setDateFilter({ startDate: '', endDate: '' });
    }, [setDateFilter]);

    const handleFiltersQueryChange = useCallback((value) => {
        setQueryValue(value);
    }, [setQueryValue]);

    useEffect(() => {
        if (!isLoadingTable) {
            const totalDurationString = calculateDuration('', '', true, shiftRecords);
            setTotalDuration(totalDurationString);
        }
    }, [isLoadingTable, shiftRecords]);

    const toggleModal = (type, id) => {
        setOpenClockOutModal(prev => ({
            isOpen: !prev.isOpen,
            type: prev.isOpen ? '' : type,
            idToAction: prev.isOpen ? '' : id
        }));
        if (type === "adminClockOut") {
            setClockOutFields({ out_time: '', note: '' });
        }
    };

    const handleClockOut = useCallback(async () => {
        const clockedOutTime = shiftRecords.find(record => record._id === openClockOutModal.idToAction)?.in_time;

        if (clockOutFields.out_time.length < 1) {
            showToast("Please fill in the 'date and time' field. It is required to clock out.");
            return;
        }
        if (new Date(clockOutFields.out_time) < new Date(clockedOutTime)) {
            showToast("Clock-out time cannot be earlier than the clock-in time.");
            return;
        }

        setLoadingButton(true);
        const apiData = {
            out_time: new Date(clockOutFields.out_time),
            email: snap.user.email,
            status: "Complete",
            note: clockOutFields.note,
            idToUpdate: openClockOutModal.idToAction
        };

        try {
            const response = await fetch('/api/attendance', {
                method: 'post',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiData)
            });

            if (response.ok) {
                const { message, attendanceData } = await response.json();
                showToast(message);

                setShiftRecords(prevAttendance =>
                    prevAttendance.map(d =>
                        d._id === openClockOutModal.idToAction ? { ...d, note: clockOutFields.note, out_time: clockOutFields.out_time, status: 'Complete' } : d
                    )
                );
            }
        } catch (error) {
            console.error('Error on clockOut', error);
        } finally {
            setLoadingButton(false);
            toggleModal();
        }
    }, [clockOutFields, shiftRecords, snap.user.email, openClockOutModal.idToAction, setShiftRecords]);

    const rowMarkup = shiftRecords.map(({ _id, in_time, out_time, note, userDetails, status }, index) => (
        <IndexTable.Row key={_id}>
            <IndexTable.Cell><Text variant="bodyMd" fontWeight="bold">{calculateItemNumber(index)}</Text></IndexTable.Cell>
            <IndexTable.Cell>{`${userDetails?.firstName} ${userDetails?.lastName}`}</IndexTable.Cell>
            <IndexTable.Cell>{moment(in_time).format('MMM DD, YYYY')}</IndexTable.Cell>
            <IndexTable.Cell>{formatTime(in_time)}</IndexTable.Cell>
            <IndexTable.Cell>{out_time ? moment(out_time).format('MMM DD, YYYY') : "--"}</IndexTable.Cell>
            <IndexTable.Cell>{out_time ? formatTime(out_time) : "--"}</IndexTable.Cell>
            <IndexTable.Cell>
                <Tooltip dismissOnMouseOut content={note ?? '---'}>
                    <Button icon={<Icon source={ChatIcon} />} />
                </Tooltip>
            </IndexTable.Cell>
            <IndexTable.Cell>{calculateDuration(in_time, out_time)}</IndexTable.Cell>
            <IndexTable.Cell>
                <Text tone={status === 'Incomplete' ? 'critical' : 'success'}>
                    {status}
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                {status === 'Incomplete' &&
                    <Button onClick={() => toggleModal('adminClockOut', _id)} icon={<Icon source={ClockIcon} />} tone='critical'>
                        Clock Out
                    </Button>
                }
            </IndexTable.Cell>
            <IndexTable.Cell>
                <ButtonGroup>
                    <Button icon={<Icon source={EditIcon} />} onClick={() => toggleModal('adminEdit', _id)} />
                </ButtonGroup>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    const handleEdit = () => {

    }
    const handleAdminInputClockChange = useCallback((data, type) => {
        if (openClockOutModal.type === "adminClockOut") {
            setClockOutFields(prev => ({
                ...prev,
                [type]: data
            }));
        } else {
            setAdminEditFields(prev => ({
                ...prev,
                [type]: data
            }));
        }
    }, [openClockOutModal.type]);

    return (
        <div className='table'>
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
                        cancelAction={{ onAction: () => setCurrentPage(1), disabled: false, loading: false }}
                        onQueryClear={() => setQueryValue('')}
                        tabs={[]}
                        filters={[
                            { key: 'startDate', label: 'In date from', filter: <TextField value={dateFilter.startDate} onChange={handleSelectingStartDate} autoComplete="off" type='date' />, shortcut: true },
                            { key: 'endDate', label: 'In date to', filter: <TextField value={dateFilter.endDate} onChange={handleSelectingEndDate} autoComplete="off" type='date' />, shortcut: true }
                        ]}
                        appliedFilters={[
                            { key: "startDate", onRemove: () => removeFilter('startDate') },
                            { key: "endDate", onRemove: () => removeFilter('endDate') }
                        ]}
                        canCreateNewView={false}
                        onClearAll={handleFiltersClearAll}
                        mode={mode}
                        setMode={setMode}
                    />
                    <IndexTable
                        itemCount={shiftRecords.length}
                        headings={[
                            { title: 'No.' }, { title: 'Employee Name.' }, { title: 'In Date' }, { title: 'In Time' },
                            { title: 'Out Date' }, { title: 'Out Time' }, { title: 'Note' }, { title: 'Duration' },
                            { title: 'Status' }, { title: 'Status Action' }, { title: 'Action' }
                        ]}
                        selectable={false}
                        pagination={{
                            hasNext: (dateFilter.startDate || dateFilter.endDate) ? false : hasNextPage,
                            hasPrevious: (dateFilter.startDate || dateFilter.endDate) ? false : hasPrevPage,
                            onNext: () => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages)),
                            onPrevious: () => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))
                        }}
                    >
                        {rowMarkup}
                    </IndexTable>
                </>
            }
            {shiftRecords.length > 0 && (dateFilter.startDate || dateFilter.endDate) &&
                <>
                    <Divider />
                    <div className='total_hours'>
                        <Text variant="headingMd" as="h6">{`Total Hours: ${totalDuration}`}</Text>
                    </div>
                </>
            }
            <ModalComponent
                isTrue={openClockOutModal.isOpen}
                toggleModal={() => toggleModal()}
                handlePrimaryAction={openClockOutModal.type === "adminClockOut" ? handleClockOut : handleEdit}
                type={openClockOutModal.type}
                primaryContent="Save"
                secondaryContent="Cancel"
                value={openClockOutModal.type === "adminClockOut" ? clockOutFields : adminEditFields}
                handleAdminInputChange={(data, type) => handleAdminInputClockChange(data, type)}
                isLoadingButton={isLoadingButton}
            />
        </div>
    );
};

export default EmployeesClockTable;
